import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

IN_PATH  = Path("data/scas_sf_19item_balanced_with_score.csv")
OUT_PATH = Path("data/scas_realistic_like.csv")

N_ITEMS = 19
QCOLS = [f"q{i:02d}" for i in range(1, N_ITEMS + 1)]
MAX_SCORE = N_ITEMS * 3

LOW_THR = 14
MOD_THR = 34

def score_to_level(score: int):
    if score <= LOW_THR:
        return 0
    if score <= MOD_THR:
        return 1
    return 2

def main(seed=42, missing_rate=0.08, invalid_rate=0.01):
    rng = np.random.default_rng(seed)
    df = pd.read_csv(IN_PATH)

    # --- Add realistic ID-like fields ---
    n = len(df)
    df.insert(0, "student_id", [f"STU{100000+i}" for i in range(n)])
    df.insert(1, "submission_id", [f"SUB{200000+i}" for i in range(n)])

    # demographics (synthetic)
    df["age"] = rng.integers(8, 16, size=n)  # 8-15
    df["gender"] = rng.choice(["M", "F"], size=n, p=[0.5, 0.5])
    df["school"] = rng.choice(["SCH01", "SCH02", "SCH03"], size=n, p=[0.4, 0.35, 0.25])

    # submitted time
    start = datetime(2025, 1, 1)
    df["submitted_at"] = [
        (start + timedelta(days=int(d), minutes=int(m))).isoformat()
        for d, m in zip(rng.integers(0, 300, size=n), rng.integers(0, 1440, size=n))
    ]

    # --- Introduce missing answers ---
    mask = rng.random((n, N_ITEMS)) < missing_rate
    for j, c in enumerate(QCOLS):
        df.loc[mask[:, j], c] = np.nan

    # --- Optional: introduce invalid values (simulate bad inputs) ---
    # Example: put "5" or "-1" rarely (you will clean later)
    invalid_mask = rng.random((n, N_ITEMS)) < invalid_rate
    for j, c in enumerate(QCOLS):
        df.loc[invalid_mask[:, j], c] = rng.choice([5, -1], size=invalid_mask[:, j].sum())

    # --- Recompute score and level with safe cleaning ---
    # Convert to numeric, invalid -> NaN
    X = df[QCOLS].apply(pd.to_numeric, errors="coerce")
    X = X.where((X >= 0) & (X <= 3), np.nan)

    # scoring choice for missing:
    # Option 1: treat missing as 0 (simple)
    # Option 2: impute mean per question (more realistic)
    X_imputed = X.fillna(X.mean())

    df["anxiety_score"] = X_imputed.sum(axis=1).round().astype(int).clip(0, MAX_SCORE)
    df["anxiety_level_num"] = df["anxiety_score"].apply(score_to_level)

    df.to_csv(OUT_PATH, index=False)
    print("Saved:", OUT_PATH)
    print(df.head(3))

if __name__ == "__main__":
    main()
