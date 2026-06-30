<p align="center">
<img src="src/igl100.png" alt="IonGrid Logo" width="150" />
</p> <h1 align="center">IonGrid</h1> <p align="center">
  <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</p>

## Project Description

IonGrid is a prioritization matrix web application designed to help users effectively manage and prioritize tasks. Built with a focus on leveraging the full capabilities of the Bun runtime, it offers a robust and efficient platform for decision-making.

## Features

*   **Interactive Prioritization Matrix:** A 3x3 drag-and-drop grid powered by `@dnd-kit/react` for intuitive task prioritization.
*   **Bun Runtime:** Developed to showcase and utilize various features of the Bun JavaScript runtime.
*   **Modern Styling:** Styled with TailwindCSS for a clean, responsive, and modern user interface.
*   **Data Persistence:** Uses Prisma with a local database file for simple data storage.
*   **Secure Authentication:** Implements JWT (JSON Web Token) for secure user authentication and session management.
*   **CSRF Protection:** Includes Cross-Site Request Forgery protection to enhance security.
*   **Rate Limiting:** Protects against abuse and ensures fair usage with HTTP request rate limiting.
*   **Logging:** Utilizes Winston for comprehensive and flexible logging.

## Technologies Used

*   **Runtime:** Bun
*   **Framework/Library:** React
*   **Styling:** TailwindCSS
*   **ORM:** Prisma
*   **Authentication:** JWT
*   **Drag and Drop:** `@dnd-kit/react`
*   **Logging:** Winston

## Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Bun (https://bun.sh/)
*   Node.js (for npm/yarn if needed for specific packages)

### Setup

1.  Clone the repository:
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd iongrid
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Set up environment variables (e.g., for JWT secret, database path). A `.env.example` file should be provided.
4.  Run database migrations:
    ```bash
    bun prisma migrate dev
    ```
5.  Start the development server:
    ```bash
    bun dev
    ```

## Usage

(Coming soon)

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Gray Pedersen - grayp03@gmail.com

Project Link: [https://github.com/Grayped/iongrid.git](https://github.com/Grayped/iongrid.git)
