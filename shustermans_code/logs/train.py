import os
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

def load_data_from_jsonl_files(logs_dir):
    """
    Load data from JSONL files where filename is label and vectors are features
    """
    X = []  # features (vectors)
    y = []  # labels (from filenames)

    # Get all .jsonl files in the logs directory
    jsonl_files = [f for f in os.listdir(logs_dir) if f.endswith('.jsonl')]

    for filename in jsonl_files:
        # Extract label from filename (remove .jsonl extension)
        label = filename.replace('.jsonl', '').replace('_samples', '')

        filepath = os.path.join(logs_dir, filename)

        with open(filepath, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())

                    # Extract vectors from the JSON object
                    # Assuming each {} contains arrays [] that are your feature vectors
                    for key, value in data.items():
                        if isinstance(value, list) and len(value) > 0:
                            # Convert list to numpy array and add to features
                            X.append(np.array(value))
                            y.append(label)

                except json.JSONDecodeError:
                    continue

    return np.array(X), np.array(y)

def train_random_forest(X, y, test_size=0.2, random_state=42):
    """
    Train Random Forest classifier
    """
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Create and train Random Forest classifier
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        random_state=random_state,
        n_jobs=-1  # Use all available cores
    )

    rf_classifier.fit(X_train, y_train)

    # Make predictions
    y_pred = rf_classifier.predict(X_test)

    # Print evaluation metrics
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return rf_classifier, X_test, y_test, y_pred

def main():
    # Load data from current logs directory
    logs_dir = "."  # Current directory (logs folder)

    print("Loading data from JSONL files...")
    X, y = load_data_from_jsonl_files(logs_dir)

    if len(X) == 0:
        print("No data found in JSONL files!")
        return

    print(f"Loaded {len(X)} samples with {len(np.unique(y))} unique labels")
    print(f"Feature vector length: {X.shape[1] if len(X.shape) > 1 else 'Variable'}")
    print(f"Labels: {np.unique(y)}")

    # Train the Random Forest model
    print("\nTraining Random Forest classifier...")
    model, X_test, y_test, y_pred = train_random_forest(X, y)

    # Save the trained model
    model_filename = "random_forest_model.pkl"
    joblib.dump(model, model_filename)
    print(f"\nModel saved as {model_filename}")

    # Feature importance
    if hasattr(model, 'feature_importances_'):
        print(f"\nTop 10 most important features:")
        feature_importance = model.feature_importances_
        top_features = np.argsort(feature_importance)[-10:][::-1]
        for i, feat_idx in enumerate(top_features):
            print(f"{i+1}. Feature {feat_idx}: {feature_importance[feat_idx]:.4f}")

if __name__ == "__main__":
    main()