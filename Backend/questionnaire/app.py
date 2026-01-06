from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL_PATH = "RandomForest_small.pkl"
model = joblib.load(MODEL_PATH)

Q_COLS = [f"q{i:02d}" for i in range(1, 31)]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        required_fields = ["age", "gender", "lives_alone"] + Q_COLS
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": "Missing fields",
                "missing_fields": missing
            }), 400

        # Validate and convert data types
        try:
            age = int(data["age"])
            gender = str(data["gender"])
            lives_alone = int(data["lives_alone"])
        except (ValueError, TypeError) as e:
            return jsonify({
                "success": False,
                "error": f"Invalid data type: {str(e)}"
            }), 400

        # Build sample dataframe
        sample_data = {
            "age": age,
            "gender": gender,
            "lives_alone": lives_alone
        }

        # Add question responses
        for q in Q_COLS:
            try:
                sample_data[q] = int(data[q])
            except (ValueError, TypeError) as e:
                return jsonify({
                    "success": False,
                    "error": f"Invalid value for {q}: {data[q]}"
                }), 400

        sample = pd.DataFrame([sample_data])

        # Compute sums
        sample["cognitive_sum"] = sample[[f"q{i:02d}" for i in range(1, 11)]].sum(axis=1)
        sample["somatic_sum"]   = sample[[f"q{i:02d}" for i in range(11, 21)]].sum(axis=1)
        sample["affective_sum"] = sample[[f"q{i:02d}" for i in range(21, 31)]].sum(axis=1)

        print("Sample dataframe created")

        # Make prediction
        prediction = model.predict(sample)[0]
        probabilities = model.predict_proba(sample)[0]

        # Get all class labels
        classes = model.classes_

        print(f"Prediction: {prediction}")
        print(f"Classes: {classes}")

        return jsonify({
            "success": True,
            "predicted_gas_level": str(prediction),  # Keep as string
            "class_probabilities": {
                str(cls): round(float(prob), 4)
                for cls, prob in zip(classes, probabilities)
            },
            "scores": {
                "cognitive": int(sample["cognitive_sum"].iloc[0]),
                "somatic": int(sample["somatic_sum"].iloc[0]),
                "affective": int(sample["affective_sum"].iloc[0]),
                "total": int(sample["cognitive_sum"].iloc[0] + 
                           sample["somatic_sum"].iloc[0] + 
                           sample["affective_sum"].iloc[0])
            }
        })

    except Exception as e:
        print("Error:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)