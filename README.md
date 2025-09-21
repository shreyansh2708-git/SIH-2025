<div align="center">
<a href="#">
<img src="https://www.google.com/search?q=https://placehold.co/150x150/2563EB/FFFFFF%3Ftext%3DS%26font%3Draleway" alt="Logo">
</a>
<h1 align="center">Samadhan: Civic Issue Reporting Platform</h1>
<p align="center">
A modern, full-stack web application designed to bridge the gap between citizens and municipal authorities for efficient civic issue resolution.
<br />
<a href="#"><strong>Explore the docs »</strong></a>
<br />
<br />
<a href="[(https://sih-2025-pi.vercel.app/login)]">View Demo</a>
·
<a href="#">Report Bug</a>
·
<a href="#">Request Feature</a>
</p>
</div>

<div align="center">

[][license-url]
[][linkedin-url]

</div>

Table of Contents
About The Project

Key Features

Screenshots

Built With

Getting Started

Prerequisites

Backend Setup

Frontend Setup

Deployment

Contributing

License

Contact

About The Project
Samadhan (a Hindi word for "solution") provides a streamlined platform for reporting local civic issues, tracking their resolution in real-time, and enabling administrators to manage and analyze this data effectively.

✨ Key Features
Real-Time Tracking: Citizens can monitor issue progress from submission to resolution.

Rich Media Uploads: Users can attach photos and voice notes for clearer reporting.

Admin Analytics: A comprehensive dashboard with charts for data-driven decision-making.

Geospatial Mapping: Interactive map to visualize the location of all reported issues.

Role-Based Access: Secure and separate dashboards for Citizens and Administrators.

Modern UI/UX: Fully responsive with a professional design and dark/light mode support.

🖼️ Screenshots
Login Page

Citizen Dashboard

Admin Dashboard







🛠️ Built With
This project is built with a modern, full-stack technology set.

Frontend:

[][React-url]

[][Vite-url]

[][TailwindCSS-url]

shadcn/ui & Recharts

Backend:

[][Node-url]

[][Express-url]

Prisma ORM

JWT for Authentication

Database:

MySQL

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Make sure you have Node.js (v18+) and MySQL installed on your system.

npm

npm install npm@latest -g

1. Backend Setup
Navigate to the backend directory.

cd "2 backend"

Install NPM packages.

npm install

Create a .env file from the example and fill in your database credentials.

cp env.example .env

Run database migrations.

npx prisma migrate dev

Start the development server.

npm run dev

The backend will be available at http://localhost:3001.

2. Frontend Setup
Navigate to the frontend directory.

cd civic-connect-fe

Install NPM packages.

npm install

Create a local environment file.

touch .env.local

Add the backend API URL to .env.local:

VITE_API_URL=http://localhost:3001/api

Start the development server.

npm run dev

The frontend will be available at http://localhost:8080.

🚢 Deployment
Frontend: The civic-connect-fe directory is ready for deployment to Vercel.

Backend: The 2 backend directory is ready for deployment on Render.

Remember to set the required environment variables (VITE_API_URL, DATABASE_URL, FRONTEND_URL) on your hosting platforms. For detailed instructions, refer to deployment_guide.md.

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📧 Contact
Your Name - @your_twitter - email@example.com

Project Link: https://github.com/your_username/your_repository

<!-- MARKDOWN LINKS & IMAGES -->

[]: #
[license-url]: https://www.google.com/search?q=https://github.com/your_username/your_repository/blob/main/LICENSE
[]: #
[linkedin-url]: https://www.google.com/search?q=https://linkedin.com/in/your_username
[]: #
[react-url]: https://reactjs.org/
[]: #
[vite-url]: https://vitejs.dev/
[]: #
[tailwindcss-url]: https://tailwindcss.com/
[]: #
[node-url]: https://nodejs.org/
[]: #
[express-url]: https://expressjs.com/


