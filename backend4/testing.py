import base64
import json
import mimetypes
import os
import re
import urllib.error
import urllib.request
from typing import Optional, Tuple


GEMINI_API_KEY = "AIzaSyCTsIETdjESDgH9q0RTv_vRINwZOAz5gec"
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

print(f"[testing.py init] GEMINI_API_KEY: {'SET' if GEMINI_API_KEY else 'NOT SET'}")
print(f"[testing.py init] GEMINI_MODEL: {GEMINI_MODEL}")
print(f"[testing.py init] GEMINI_ENDPOINT: {GEMINI_ENDPOINT}")


def _extract_age_from_text(text: str) -> Optional[int]:
    if not text:
        return None
    # prefer explicit JSON like {"age": 68}
    try:
        j = json.loads(text)
        if isinstance(j, dict) and "age" in j:
            age_val = j["age"]
            if isinstance(age_val, int) and 1 <= age_val <= 120:
                return age_val
            return None
    except Exception:
        pass

    # fallback: find an integer between 1 and 120 (ignore 0)
    match = re.search(r"\b([1-9][0-9]{0,2})\b", text)
    if not match:
        return None
    age = int(match.group(1))
    if 1 <= age <= 120:
        return age
    return None


def predict_age_from_image(image_path: str) -> Tuple[Optional[int], int, Optional[dict]]:
    """Predict an age from an image using Gemini.

    Returns (predicted_age or None, is_ai_predicted (1/0), raw_response_or_None)
    """

    print(f"testing.py: predict_age_from_image called with path: {image_path}")
    print(f"testing.py: GEMINI_API_KEY is {'SET' if GEMINI_API_KEY else 'NOT SET'}")

    if not GEMINI_API_KEY:
        print("testing.py: ERROR - GEMINI_API_KEY not set")
        return None, 0, None

    if not image_path or not os.path.exists(image_path):
        print(f"testing.py: ERROR - image file does not exist: {image_path}")
        return None, 0, None

    try:
        print(f"testing.py: Reading image file...")
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
        print(f"testing.py: Image file read successfully ({len(image_bytes)} bytes)")

        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith("image/"):
            mime_type = "image/jpeg"

        last_response = None

        # Try twice: moderate tokens first, then larger if model hit MAX_TOKENS
        for attempt, max_tokens in enumerate((64, 256)):
            print(f"testing.py: Attempt {attempt + 1} with maxOutputTokens={max_tokens}")
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    "You are given a face image. Return a JSON object exactly in this form: "
                                    "{\"age\": <integer between 1 and 120>} if you can estimate the age, "
                                    "otherwise return {\"age\": null}. "
                                    "Do not add any extra text, explanation or punctuation."
                                )
                            },
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": base64.b64encode(image_bytes).decode("utf-8"),
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": max_tokens,
                },
            }

            request = urllib.request.Request(
                f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(request, timeout=60) as response:
                response_data = json.loads(response.read().decode("utf-8"))

            last_response = response_data
            print(f"testing.py: Got response with keys: {list(response_data.keys())}")

            # Extract texts from common places in Gemini responses
            texts = []
            candidates = response_data.get("candidates") or response_data.get("outputs")

            if isinstance(candidates, list):
                for cand in candidates:
                    if isinstance(cand, dict):
                        content = cand.get("content") or cand
                        if isinstance(content, dict):
                            parts = content.get("parts") or content.get("messages") or []
                            for part in parts:
                                if isinstance(part, dict) and part.get("text"):
                                    texts.append(part.get("text"))
                                    print(f"testing.py: Extracted text: {part.get('text')}")
                                elif isinstance(part, str):
                                    texts.append(part)
                        elif isinstance(content, str):
                            texts.append(content)
                    elif isinstance(cand, str):
                        texts.append(cand)

            # Older/newer shapes
            if not texts:
                output = response_data.get("output") or response_data.get("result")
                if isinstance(output, dict):
                    for key in ("content", "text", "message", "messages", "parts"):
                        val = output.get(key)
                        if isinstance(val, str):
                            texts.append(val)
                        elif isinstance(val, list):
                            for item in val:
                                if isinstance(item, dict) and item.get("text"):
                                    texts.append(item.get("text"))
                                elif isinstance(item, str):
                                    texts.append(item)

            if not texts:
                texts.append(json.dumps(response_data))

            joined = "\n".join(texts)
            print(f"testing.py: Joined text: {joined}")
            predicted_age = _extract_age_from_text(joined)

            # Check finish reason to decide whether to retry
            finish_reason = None
            try:
                first_cand = candidates[0] if isinstance(candidates, list) and candidates else {}
                if isinstance(first_cand, dict):
                    finish_reason = first_cand.get("finishReason") or first_cand.get("finish_reason")
            except Exception:
                finish_reason = None

            if predicted_age is not None:
                print(f"testing.py: Success! Predicted age: {predicted_age}")
                return predicted_age, 1, response_data

            if finish_reason and str(finish_reason).upper() == "MAX_TOKENS":
                print(f"testing.py: Hit MAX_TOKENS, retrying with larger maxOutputTokens")
                continue

            print(f"testing.py: No age found, stopping retries")
            break

        # write debug dump for inspection
        try:
            dump_path = os.path.join(os.getcwd(), "testing_last_response.json")
            with open(dump_path, "w", encoding="utf-8") as f:
                json.dump(last_response or {}, f, ensure_ascii=False, indent=2)
            print(f"testing.py: Gemini response saved to {dump_path}")
        except Exception as e:
            print(f"testing.py: failed to write debug response dump: {e}")

        return None, 0, last_response

    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        print(f"testing.py: HTTP error calling Gemini: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return None, 0, None
    except (OSError, ValueError, KeyError, IndexError, TypeError) as e:
        print(f"testing.py: Error during processing: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return None, 0, None
