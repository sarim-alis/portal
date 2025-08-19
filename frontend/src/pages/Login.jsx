// frontend/src/Components/Login/Login.jsx
// Imports.
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import styles from '../styles/login.js';
import { useNavigate } from "react-router-dom";


// Frontend.
const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  // States.
  const initialValues = {
    email: '',
    password: '',
  };

  // Schema.
  const Schema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  // Handle submit.
  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (res.ok) {
      // Login successful
      toast.success('Login successful! 🎉');
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
      onLogin(); // Or store token/data if needed
    } else {
      toast.error(data.error || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Something went wrong');
  } finally {
    setSubmitting(false);
  }
};


  const butts = {button: {padding: '10px',backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',borderColor: 'rgba(0, 0, 0, 0.45)',color: 'white',borderRadius: '4px',cursor: 'pointer'}};


  return (
    <div>
        <h1 className="text-3xl text-center font-bold text-[#808080] m-4 mb-8">Login</h1>
      <div style={styles.container}>
      <Formik initialValues={initialValues} validationSchema={Schema} onSubmit={handleSubmit}>
        <Form style={styles.form}>
          <img src="/logo.svg" alt="Logo" style={{ width: '120px', height: '120px', marginBottom: '20px', alignSelf: 'center' }} />

          {/* Email */}
          <label style={styles.label}>
            Email<span style={{ color: '#ce1127' }}>*</span>
          </label>
          <Field name="email" style={styles.input} />
          <ErrorMessage name="email" component="div" style={styles.error} />

          {/* Password */}
          <label style={styles.label}>
            Password<span style={{ color: '#ce1127' }}>*</span>
          </label>
          <Field name="password" type="password" style={styles.input} />
          <ErrorMessage name="password" component="div" style={styles.error} />

           {/* Save */}
           <button type="submit" style={butts.button} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            Login
           </button>
        </Form>
      </Formik>
    </div>
    </div>
  );
};

export default Login;