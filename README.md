# BlitzARena – Augmented Reality Shooter Game

**BlitzARena** is an innovative Augmented Reality (AR) shooter game that merges real-world movement with virtual gameplay. Designed for mobile platforms, it utilizes **AI**, **computer vision**, and **real-time image processing** to deliver an immersive and competitive multiplayer experience.

🎥 **Demo video**: [Watch on YouTube](https://youtu.be/LuKIQAvNbXc)

---

## 🚀 Features

- Real-time AR combat using mobile phone cameras
- AI-powered player recognition with custom-trained models
- Cardboard weapon support for enhanced immersion
- Multiplayer gameplay via WebSocket communication
- Dynamic scoring and player statistics
- Optimized energy efficiency for mobile devices

---

## 🧠 Technologies Used

- **Frontend**: React Native (TypeScript)
- **Backend**:
  - NestJS (Chore & Game Session microservices)
  - FastAPI (Model Trainer microservice)
- **AI/ML**:
  - YOLOv8 nano for pose and player classification
  - TensorFlow Lite for mobile inference
- **Database**: MongoDB
- **Cloud Storage**: Firebase Storage
- **Communication**: WebSocket

<p align="center">
  <img src="https://github.com/user-attachments/assets/69d87276-4be7-4c4b-8c51-747d3631ad09" width="600" alt="System Architecture"/>
</p>

---

## 🎮 Game Flow

### 1. Create & Join Match  
Host generates a QR code, other players scan to join.

<p align="center">
  <img src="https://github.com/user-attachments/assets/92354773-b214-400f-b9b2-7b5dd65676d8" width="400"/>
</p>

---

### 2. Data Collection for AI Training  
Players take photos of each other in small training groups.

<p align="center">
  <img src="https://github.com/user-attachments/assets/e70c12ce-a5a2-479b-ae4e-22f77dab6fc1" width="400"/>
</p>

---

### 3. Team Setup & Map Configuration  
Players are assigned teams and the arena is set on the map.

---

### 4. Live Match Begins  
Players aim with phones mounted on cardboard guns. AI identifies the player and body part hit.

<p align="center">
  <img src="https://github.com/user-attachments/assets/6519b80f-e1cc-4a55-a6b5-1bf8d8c43401" width="360"/>
  <img src="https://github.com/user-attachments/assets/2acb8fdd-87f9-462e-b6d1-99b9048ec878" width="360"/>
</p>

---

### 5. Rounds & Scoring  
10 rounds per match. Stats and scores are calculated at the end.

---

## 🧩 AI & Model Details

- **YOLO Pose** – Identifies 17 body keypoints (e.g., head, torso, limbs)
- **YOLO Classification** – Trained before each game to recognize specific players
- **Image Filtering Model** – Ensures only valid images (containing humans) are used for training
- Models are exported to **ONNX** and **TensorFlow Lite** for mobile optimization

---

## 🔐 Security

- JWT authentication for all services
- Bcrypt hashing for passwords and tokens
- WebSocket token validation per session
- Secure camera and location permission handling

---

## 📈 Future Development Ideas

- New weapon types with different stats
- Expanded multiplayer modes (e.g., capture the flag)
- Arena/map editor for custom matches
- Support for AR glasses or wearable hardware

---

## 📚 References

- [Brad Frost – Atomic Design](http://atomicdesign.bradfrost.com/)
- [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- [TensorFlow Lite](https://www.tensorflow.org/lite)
- [React Native Documentation](https://reactnative.dev/)
- Faccio & McConnell – *Death by Pokémon Go*, SSRN, 2018

---

**Created by Nagy Botond – Sapientia Hungarian University of Transylvania**  
*Bachelor Thesis, 2025
