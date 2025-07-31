// frontend/src/Components/Login/Login.jsx
// Imports.
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from '../styles/login.js';


// Frontend.
const Login = () => {
  const [isHovered, setIsHovered] = useState(false);
  // States.
  const initialValues = {
    username: '',
    password: '',
  };

  // Schema.
  const Schema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  // Handle submit.
  const handleSubmit = (values) => {
    console.log('Submitting', values);
    // TODO: Connect to backend API here
  };

  const butts = {button: {padding: '10px',backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',borderColor: 'rgba(0, 0, 0, 0.45)',color: 'white',borderRadius: '4px',cursor: 'pointer'}};


  return (
    <div>
        <h1 className="text-3xl text-center font-bold text-[#808080] m-4 mb-8">Login 🌬️</h1>
      <div style={styles.container}>
      <Formik initialValues={initialValues} validationSchema={Schema} onSubmit={handleSubmit}>
        <Form style={styles.form}>
          <img src="/logo.svg" alt="Logo" style={{ width: '120px', height: '120px', marginBottom: '20px', alignSelf: 'center' }} />

          {/* Username */}
          <label style={styles.label}>
            Username<span style={{ color: '#ce1127' }}>*</span>
          </label>
          <Field name="username" style={styles.input} />
          <ErrorMessage name="username" component="div" style={styles.error} />

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