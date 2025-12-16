import numpy as np
import pandas as pd
from pathlib import Path

N_ITEMS = 19
FEATURES = [f"q{i:02d}" for i in range(1, N_ITEMS + 1)]

def gen_block(rng, n_rows, probs):
    return rng.choice([0, 1, 2, 3], size=(n_rows, N_ITEMS), p=probs)

def main(n_each=2000, out_path="data/scas_sf_19item_balanced_with_score.csv", seed=42):
    rng = np.random.default_rng(seed)

    # low: mostly 0/1
    X_low  = gen_block(rng, n_each, probs=[0.60, 0.28, 0.10, 0.02])
    # moderate: mixed
    X_mod  = gen_block(rng, n_each, probs=[0.30, 0.35, 0.25, 0.10])
    # high: mostly 2/3
    X_high = gen_block(rng, n_each, probs=[0.10, 0.20, 0.40, 0.30])

    X = np.vstack([X_low, X_mod, X_high])
    levels = (["low"] * n_each) + (["moderate"] * n_each) + (["high"] * n_each)

    level_num_map = {"low": 0, "moderate": 1, "high": 2}
    level_nums = [level_num_map[l] for l in levels]

    df = pd.DataFrame(X, columns=FEATURES)
    df["anxiety_score"] = df[FEATURES].sum(axis=1).astype(int)   # <-- numeric score
    df["anxiety_level_num"] = level_nums                         # <-- numeric level
    df["anxiety_level"] = levels                                 # optional text

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    print("Saved:", out_path)
    print(df["anxiety_level"].value_counts())
    print(df.head(5))

if __name__ == "__main__":
    main()
