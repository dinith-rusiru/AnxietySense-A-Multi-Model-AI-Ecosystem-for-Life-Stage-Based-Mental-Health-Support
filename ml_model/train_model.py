
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib

# Load the dataset
data = pd.read_csv('../Dataset/GAD7_1000_sample_data_clean.csv')

# Preprocess the data
# Encode the target variable
le = LabelEncoder()
data['AnxietyLevel'] = le.fit_transform(data['AnxietyLevel'])

# Define features (X) and target (y)
X = data[['TotalScore']]
y = data['AnxietyLevel']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the SVM model
model = SVC(kernel='linear', random_state=42)
model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
print(f'Model Accuracy: {accuracy * 100:.2f}%')

# Save the trained model and the encoder
joblib.dump(model, 'gad7_svm_model.pkl')
joblib.dump(le, 'anxiety_level_encoder.pkl')

print("Model and encoder saved.")
