from flask import Flask, request, jsonify
import joblib
import pandas as pd

#pip install scikit-learn==1.8.0

app = Flask(__name__)

MODEL_PATH = "RandomForest_small.pkl"
model = joblib.load(MODEL_PATH)

Q_COLS = [f"q{i:02d}" for i in range(1, 31)]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        required_fields = ["age", "gender", "lives_alone"] + Q_COLS
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "error": "Missing fields",
                "missing_fields": missing
            }), 400

        sample = pd.DataFrame([data])

        sample["cognitive_sum"] = sample[[f"q{i:02d}" for i in range(1, 11)]].sum(axis=1)
        sample["somatic_sum"]   = sample[[f"q{i:02d}" for i in range(11, 21)]].sum(axis=1)
        sample["affective_sum"] = sample[[f"q{i:02d}" for i in range(21, 31)]].sum(axis=1)

        prediction = model.predict(sample)[0]
        probabilities = model.predict_proba(sample)[0]

        return jsonify({
            "predicted_gas_level": int(prediction),
            "class_probabilities": {
                str(cls): float(prob)
                for cls, prob in zip(model.classes_, probabilities)
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)





