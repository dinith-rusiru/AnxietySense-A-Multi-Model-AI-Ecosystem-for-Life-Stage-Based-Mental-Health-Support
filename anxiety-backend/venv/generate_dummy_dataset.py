# generate_dummy_dataset.py
import numpy as np
import pandas as pd

np.random.seed(42)

def make_sample(age):
    # 7-question GAD-like: answers 0..3 (Not at all -> Nearly every day)
    q = np.random.choice([0,1,2,3], size=7, p=[0.3,0.3,0.25,0.15])
    # simple face-like features simulated (smile prob, leftEyeOpen, rightEyeOpen)
    smile = np.clip(np.random.normal(0.5 - 0.02*(q.sum()-7), 0.2), 0, 1) # more anxious -> slightly less smiling
    left_eye = np.clip(np.random.normal(0.6 - 0.01*(q.sum()-7), 0.2), 0, 1)
    right_eye = np.clip(np.random.normal(0.6 - 0.01*(q.sum()-7), 0.2), 0, 1)
    # Combine features
    features = list(q) + [smile, left_eye, right_eye, age]
    # Simple label rule (for dummy data)
    score = q.sum()
    if score <= 4:
        label = 'low'
    elif score <= 10:
        label = 'moderate'
    else:
        label = 'high'
    return features + [label]

rows = []
for _ in range(2000):
    age = np.random.randint(10,17)  # 10..16 inclusive
    rows.append(make_sample(age))

cols = [f'q{i+1}' for i in range(7)] + ['smile','left_eye','right_eye','age','label']
df = pd.DataFrame(rows, columns=cols)
df.to_csv('child_dummy_dataset.csv', index=False)
print("Saved child_dummy_dataset.csv with", len(df), "rows")
