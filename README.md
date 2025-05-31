---

# Freelance Bidding Platform

A full-stack freelance bidding platform enabling real-time auctions, fast project search, and secure payments. Built using the **MERN** stack with **Socket.io**, **Redis**, and **Razorpay** for real-time communication, accelerated search, and seamless payments.

---

### 🔧 Key Features

* ⚡ **Real-Time Bidding**
  Sub-200 ms latency updates using **Socket.io** for a snappy bidding experience.

* 🚀 **Optimized Search & Filtering**
  Redis caching accelerates project discovery, improving search speed by **40%**.

* 💬 **Post-Payment Chat**
  Real-time messaging between clients and freelancers post-transaction for smooth collaboration.

* 💳 **Secure Payments**
  Integrated with **Razorpay** to ensure fast and secure online transactions.

* 🔁 **Full MERN Stack Separation**
  Clear separation of concerns with scalable frontend and backend services.

---

### 🛠️ Tech Stack

| Layer           | Technology          |
| --------------- | ------------------- |
| Frontend        | React.js            |
| Backend         | Node.js, Express.js |
| Database        | MongoDB             |
| Realtime Comm.  | Socket.io           |
| Caching Layer   | Redis               |
| Payment Gateway | Razorpay            |

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HarshvardhanPandey2003/Freelance-Bidding-Platform.git
cd Freelance-Bidding-Platform
```

---

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

---

### 4. Configure Environment Variables

Create `.env` files in both the `backend/` and `frontend/` directories.

<details>
<summary>🔐 Sample Backend `.env`</summary>

```env
MONGO_URI=your_mongo_connection_string
REDIS_URL=your_redis_url
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your_jwt_secret
```

</details>

---

## 📦 Core Functionalities

* **Freelancers** can:

  * Browse & filter projects
  * Bid in real time
  * Chat with clients after payment

* **Clients** can:

  * Post projects
  * Receive & manage bids live
  * Connect with freelancers post-payment

* **Admin & Support**:

  * Future scope includes adding an admin dashboard for platform monitoring.

---

## 🤝 Contributing

We welcome contributions! Follow the steps below to get started:

```bash
# Fork the repository
# Create a new branch for your feature
git checkout -b feature/YourFeature

# Make your changes
git commit -m "Add YourFeature"
git push origin feature/YourFeature

# Open a Pull Request
```

---

## 📬 Contact

**Harshvardhan Pandey**
📧 [harshvardhanpandey2003@gmail.com](mailto:harshvardhanpandey2003@gmail.com)
🔗 [GitHub Profile](https://github.com/HarshvardhanPandey2003)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---
