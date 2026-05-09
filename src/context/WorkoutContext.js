import React, { createContext, useState } from 'react';

// Membuat Context
export const WorkoutContext = createContext();

// Membuat Provider untuk membungkus aplikasi
export const WorkoutProvider = ({ children }) => {
  // Menyimpan data sesi: [{ exerciseId, perfect, bad, time }]
  const [completedExercises, setCompletedExercises] = useState([]);
  
  // Menyimpan ID workout yang sedang dikerjakan (agar tidak kecampur workout lain)
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);

  // Fungsi untuk menambah hasil latihan
  const addCompletedExercise = (exerciseData) => {
    setCompletedExercises((prev) => [...prev, exerciseData]);
  };

  // Fungsi untuk mereset sesi (kalau stop di tengah jalan atau selesai semua)
  const clearSession = () => {
    setCompletedExercises([]);
    setActiveWorkoutId(null);
  };

  return (
    <WorkoutContext.Provider value={{
      completedExercises,
      activeWorkoutId,
      setActiveWorkoutId,
      addCompletedExercise,
      clearSession
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};