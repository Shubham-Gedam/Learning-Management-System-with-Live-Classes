import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import { Provider } from "react-redux";
import { store } from "./store";

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
import Quiz from "./pages/Quiz";
import InstructorUpload from "./pages/InstructorUpload";
import InstructorDashboard from "./pages/InstructorDashboard";
import CreateCourse from "./pages/CreateCourse";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />

              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/learn/:courseId" element={<LearnCourse />} />

              <Route path="/checkout/:courseId" element={<Checkout />} />

              <Route
                path="/instructor/dashboard"
                element={<InstructorDashboard />}
              />
              <Route path="/instructor/upload" element={<InstructorUpload />} />
              <Route
                path="/instructor/create-course"
                element={<CreateCourse />}
              />

              <Route path="/classes" element={<Classes />} />
              <Route path="/live-room" element={<LiveRoom />} />

              <Route
                path="/certificate/:certificateId"
                element={<Certificate />}
              />
              <Route path="/quiz/:lessonId" element={<Quiz />} />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );  
}

export default App;
