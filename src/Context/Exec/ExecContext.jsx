import React, { createContext, useState } from 'react';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../Firebase_config';

export const ExecutiveContext = createContext();

const ExecutiveContextProvider = ({ children }) => {
  const collectionRef = collection(db, 'Executives');

  const [executives, setExecutives] = useState([]);

  const getExecutives = async () => {
    try {
      const q = query(collectionRef, orderBy('createdAt', 'asc')); // Sort by createdAt
      const data = await getDocs(q);
      const executivesData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(), // Convert Firestore timestamp to JS Date
      }));
      setExecutives(executivesData);
    } catch (error) {
      console.error('Error fetching executives:', error);
    }
  };

  return (
    <ExecutiveContext.Provider value={{ executives, getExecutives, setExecutives }}>
      {children}
    </ExecutiveContext.Provider>
  );
};

export default ExecutiveContextProvider;