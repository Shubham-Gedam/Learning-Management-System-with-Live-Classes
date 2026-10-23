
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";
import LearnCourse from "./pages/LearnCourse";
import Checkout from "./pages/Checkout";
import Classes from "./pages/Classes";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";
import LiveRoom from "./pages/LiveRoom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />

          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/learn/:courseId" element={<LearnCourse />} />

          <Route path="/checkout/:courseId" element={<Checkout />} />

          <Route path="/classes" element={<Classes />} />
          <Route path="/live-room" element={<LiveRoom />} />

          <Route
            path="/certificate/:certificateId"
            element={<Certificate />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
