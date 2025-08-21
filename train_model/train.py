import os
import pandas as pd
import numpy as np
import glob
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier


def load_data(base_dir="D:\\train"):
    """
    Load CSV files from subfolders keeping the original sequence data.
    """
    data = []
    labels = []

    label_dirs = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

    for label in label_dirs:
        label_path = os.path.join(base_dir, label)
        csv_files = glob.glob(os.path.join(label_path, "*.csv"))

        for csv_file in csv_files:
            try:
                # Read the CSV file
                df = pd.read_csv(csv_file)

                # Get the sequence data as a 1D array
                sequence = df.iloc[:, 0].values

                # Ensure all sequences have the same length (3000)
                if len(sequence) > 3000:
                    sequence = sequence[:3000]
                elif len(sequence) < 3000:
                    # Pad with zeros if shorter
                    sequence = np.pad(sequence, (0, 3000 - len(sequence)))

                data.append(sequence)
                labels.append(label)

                print(f"Processed: {csv_file}")
            except Exception as e:
                print(f"Error processing {csv_file}: {e}")

    return np.array(data), np.array(labels)


def train_rf_model(X, y):
    """
    Train a Random Forest model on the sequence data.
    """
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print("Training Random Forest model...")
    # Create and train the Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        n_jobs=-1,
        random_state=42
    )

    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Test accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    return model, le




def train_xgb_model(X, y):
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    model = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5,
                          random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Test accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    return model, le


def main():
    # Load the data
    print("Loading data...")
    X, y = load_data()

    if len(X) == 0:
        print("No data found. Check the directory path and CSV files.")
        return

    print(f"Loaded {len(X)} samples with {len(set(y))} unique labels")

    # Train the model
    model, label_encoder = train_xgb_model(X, y)

    # Save the model
    with open("site_classifier_rf_model.pkl", "wb") as f:
        pickle.dump(model, f)

    # Save the label encoder
    with open("label_encoder.pkl", "wb") as f:
        pickle.dump(label_encoder, f)

    print("Model and label encoder saved")


if __name__ == "__main__":
    main()