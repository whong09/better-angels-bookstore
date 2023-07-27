# better-angels-bookstore

Big ups to chatgpt  
https://chat.openai.com/share/3860abad-829b-47b5-a0b9-9d943db3d3e5

<p float="left">
   <img src="https://i.imgur.com/5y5Rve5.png" alt="login" width="100" height="200">
   <img src="https://i.imgur.com/iZ0Eq9b.png" alt="signup" width="100" height="200">
   <img src="https://i.imgur.com/0NeUMKO.png" alt="bookstore (list)" width="100" height="200">
   <img src="https://i.imgur.com/SjP9vAQ.png" alt="reserve book" width="100" height="200">
   <img src="https://i.imgur.com/98nJztH.png" alt="profile" width="100" height="200">
</p>

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

   , or optionally scan the QR code on your mobile device using the Expo Go app.

4. If you encounter a network error with Axios, run the following command to set up reverse port forwarding:

   ```bash
   adb reverse tcp:8163 tcp:8163
   ```

## Design Discussion

In this project, I made the following technology choices:

### Backend:

- **Web Server**: Django with PostgreSQL
- **Containerization**: Docker/Docker Compose

### Frontend:

- **Mobile App**: React Native with TypeScript
- **Development Tool**: Expo

#### Backend Choice:

For the web server and database backend, I opted for Django with PostgreSQL. The decision was driven by Django's reputation as a highly opinionated and feature-rich web app framework, making it suitable for implementing the API server. Its adoption by large-scale companies like Airbnb and Pinterest also attested to its performance and reliability. Docker/Docker Compose compatibility was chosen to facilitate the onboarding process for new developers. While I lacked prior experience with some of the chosen technologies (PostgreSQL, JavaScript, and Flask), I believed this stack would provide the best foundations for the project's requirements.

Django's organizational pattern of defining class-based APIViews minimized the lines of code needed, contributing to the efficiency of the development process. Furthermore, Django Rest Framework offered convenient and usable authentication and API modules. I opted for JWT token authentication for increased security and the ability to decode the token without additional database queries, enabling better authorization control for user accounts.

The selection of PostgreSQL was a natural fit due to its seamless integration with Django and its robust out-of-the-box functionality. Leveraging PostgreSQL's full-text search capabilities eliminated the need for a separate search engine like Elasticsearch. Considering the expected throughput of the hypothetical bookstore scenario, PostgreSQL's scalability was more than adequate for the project's needs. With thorough indexing, the data design was optimized for reads, as writes were anticipated to be less frequent.

#### Frontend Choice:

React Native with TypeScript was chosen for the frontend to meet the project's requirement for a mobile app. TypeScript's type safety checks were considered worthwhile, even though it required some additional configuration for certain npm packages. Expo was instrumental in enabling rapid setup, Android emulation, and streamlined development with hot reload capabilities. Its support for native components and device integration addressed potential future needs for features like camera and GPS access.

While this project focused on a simple CRUD application, Expo's flexibility with native components provided a viable solution for more complex mobile apps. The fact that Expo allows for custom development clients for native device integration added to its appeal. I conducted research on Expo's team, usage policies, and services, and found that while they monetize certain deployment services, their open-source software permits commercial use. This means users can run their own Expo build and deploy servers, as well as manage OTA upgrades independently.

#### Additional Considerations:

The frontend development did not warrant the implementation of a more complex state management library like React Redux. Instead, I used contexts to achieve the necessary functionality. For future projects, React Query would be a potential option for front-end data management. However, it's important to consider UX performance, as React's rendering approach may present challenges in designing a performant and optimized app.

The mobile design was tailored to provide a smooth user experience, emphasizing screen real estate, large button contact surfaces, and minimal information density on each screen. Notably, mobile and web experiences should have separate implementations to cater to their distinct aspect ratios and user behavior.

If given more time, I would refactor the frontend into components and explore front-end testing with tools like Detox or other automated emulator/device testing solutions.

#### Conclusion:

Throughout the project, ChatGPT served as an invaluable resource. It not only helped me grasp unfamiliar frameworks and tools but also saved significant time by generating modules, tests, and documentation. I relied on ChatGPT for rubber duck debugging, pair programming, and brainstorming sessions. The project even benefited from ChatGPT's assistance in debugging container-related issues, leading to the inclusion of a Docker Compose definition.

The use of large language models like ChatGPT has become essential in programming, providing valuable support and improving development efficiency. To work effectively with ChatGPT, specificity and precision in queries are essential. Quoting code is helpful, as it doesn't have a perfect memory, and including code snippets as examples can yield more accurate results. With proper handling of inaccuracies and debugging of any introduced bugs, ChatGPT can be a powerful tool in the software development process.

Overall, the project was a successful blend of back-end and front-end development, leveraging Django, PostgreSQL, React Native with TypeScript, and Expo.

\- ChatGPT

I had ChatGPT rewrite my design discussion to be less informal. Though, it didn't seem to want to include this bit about tips on getting ChatGPT to cooperate.

Some tips for working with ChatGPT - be very specific and precise, quoting code is helpful (as it either doesn't have memory or has really poor memory), don't be afraid to write out snippets of implementation as an example, there are ways to get it to format things the way you want (write a shell script that writes this code/document to a file), be prepared to fix its inaccuracies and debug bugs it introduces. Sometimes you can just pass it code and ask why is it not working, and it can figure it out.

https://chat.openai.com/share/da200358-6373-498f-a7a0-fd22d8f210e4
