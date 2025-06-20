# BlitzARena – Augmented Reality Shooter Game


**BlitzARena** is an innovative Augmented Reality (AR) shooter game that merges real-world movement with virtual gameplay. Designed for mobile platforms, it utilizes **AI**, **computer vision**, and **real-time image processing** to deliver an immersive and competitive multiplayer experience.

🔗 **Demo video**: [Watch on YouTube](https://youtu.be/LuKIQAvNbXc)

---

## 🚀 Features

- **Real-time AR combat** using mobile phone cameras
- **AI-powered player recognition** with custom trained models
- **Custom cardboard gun support** for improved immersion
- **Multiplayer gameplay** with live synchronization and WebSocket communication
- **Dynamic scoring and player stats**
- **Energy-efficient algorithms** optimized for mobile usage

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
- **Real-time Communication**: WebSocket

📌 *System architecture:*  


---

## 🎮 Game Flow

1. **Create & Join Match**  
   Host generates a QR code, other players scan to join.  
   ![Join screen](./images/page10_join.png)

2. **Data Collection for AI Training**  
   Players take photos of each other in training groups.  
   ![Training](./images/page11_training.png)

3. **Team Setup & Map Configuration**

4. **Live Match Begins**  
   - Players aim using their phones mounted on cardboard weapons.
   - Real-time camera analysis identifies hit players and body parts.
   - Damage is calculated based on hit area and weapon stats.  
   ![Combat](./images/page12_combat.png)

5. **Rounds & Scoring**  
   - 10 rounds, stats generated at the end.  
   - Team with most points wins.

---


## 🧩 AI & Model Details

- **YOLO Pose**: Used to identify body parts (head, torso, limbs)
- **YOLO Classification**: Trained each game to recognize participating players
- **Image Filtering**: A separate model ensures only valid human images are used for training
- **ONNX & TensorFlow Lite** models optimized for edge devices

---

## 🔐 Security

- **JWT Authentication** for all services
- **Bcrypt hashing** for sensitive data
- **WebSocket validation** per game session
- **Camera & Location permissions** handled securely

---


## 📈 Further Development Ideas

- More weapon types
- Enhanced multiplayer modes
- Map editor for custom arenas
- Integration with AR glasses

---

## 📚 References

- [Brad Frost – Atomic Design](http://atomicdesign.bradfrost.com/)
- [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- [TensorFlow Lite](https://www.tensorflow.org/lite)
- [React Native Docs](https://reactnative.dev/)
- Faccio & McConnell – *Death by Pokémon Go*, SSRN, 2018

---



