# better-angels-bookstore

Big ups to chatgpt  
https://chat.openai.com/share/3860abad-829b-47b5-a0b9-9d943db3d3e5

## Setup Requirements

Before getting started, you'll need to have the following software installed on your system:

- [Python](https://www.python.org/downloads/)
- [Node.js and npm](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)
- [React Native / Expo](https://reactnative.dev/docs/environment-setup?guide=quickstart)
- [Android Emulator (Optional)](https://reactnative.dev/docs/environment-setup?guide=native&platform=android#:~:text=Java%20Development%20Kit)

## Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### Step 2: Set Up Django Server with PostgreSQL Database

1. Generate django secret key

   ```bash
   export DJANGO_SECRET_KEY=$(openssl rand -base64 50 | tr -d '\n')
   ```

1. Build and run the Docker containers:

   ```bash
   docker-compose up --build
   ```

1. The Django server will be available at [http://localhost:8000/](http://localhost:8000/).

### Step 3: Set Up React Native Client

1. Install Expo CLI globally (if you haven't already):

   ```bash
   npm install -g expo-cli
   ```

2. Install project dependencies:

   ```bash
   cd client
   npm install
   ```

### Step 4: Run the React Native Client

1. Start the Expo development server:

   ```bash
   npx expo start -g
   ```

2. Press 'a' to launch and connect to the Android emulator, or optionally scan the QR code on your mobile device using the Expo Go app.

3. If you encounter a network error with Axios, run the following command to set up reverse port forwarding:

   ```bash
   adb reverse tcp:8163 tcp:8163
   ```
