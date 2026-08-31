import os
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def split_datasets(data_dir="Backend/app/ai/artifacts/datasets", test_size=0.2, random_state=42):
    logger.info("Splitting datasets with entity awareness (GroupShuffleSplit)...")
    
    datasets = ["employment", "salary", "retention"]
    
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    
    for ds_name in datasets:
        file_path = os.path.join(data_dir, f"{ds_name}_dataset.csv")
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {file_path}")
            continue
            
        df = pd.read_csv(file_path)
        
        if df.empty:
            logger.warning(f"Dataset {ds_name} is empty.")
            continue
            
        if 'trainee_id' not in df.columns:
            logger.error(f"'trainee_id' missing from {ds_name} dataset. Cannot group split.")
            continue
            
        # Perform group split based on trainee_id
        train_idx, test_idx = next(gss.split(df, groups=df['trainee_id']))
        
        train_df = df.iloc[train_idx]
        test_df = df.iloc[test_idx]
        
        # Verify no entity leakage
        train_entities = set(train_df['trainee_id'])
        test_entities = set(test_df['trainee_id'])
        leakage = train_entities.intersection(test_entities)
        
        if leakage:
            logger.error(f"Leakage detected in {ds_name}! {len(leakage)} entities in both splits.")
            raise ValueError(f"Entity leakage in {ds_name}")
            
        logger.info(f"{ds_name}: Total {len(df)}, Train {len(train_df)}, Test {len(test_df)}")
        
        train_path = os.path.join(data_dir, f"{ds_name}_train.csv")
        test_path = os.path.join(data_dir, f"{ds_name}_test.csv")
        
        train_df.to_csv(train_path, index=False)
        test_df.to_csv(test_path, index=False)
        
    logger.info("Splitting complete.")

if __name__ == "__main__":
    split_datasets()
