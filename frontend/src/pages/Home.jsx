
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="hero">
      <span className="eyebrow">
        YOUR LEARNING JOURNEY STARTS HERE
      </span>

      <h1>
        Learn new skills.
        <br />
        <span>Build your future.</span>
      </h1>

      <p>
        Explore courses, attend live classes, track your progress,
        and earn certificates — all in one place.
      </p>

      <div className="hero-actions">
        <Link to="/courses" className="primary-btn">
          Explore Courses →
        </Link>

        <Link to="/register" className="secondary-btn">
          Create Account
        </Link>
      </div>
    </main>
  );
}

export default Home;
