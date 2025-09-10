import React, { createContext, useState } from 'react';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../Firebase_config';

export const EventContext = createContext();

const EventContextProvider = ({ children }) => {
  const collectionRef = collection(db, 'Events');

  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    try {
      const q = query(collectionRef, orderBy('createdAt', 'asc')); // Sort by createdAt
      const data = await getDocs(q);
      const eventsData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(), // Convert Firestore timestamp to JS Date
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <EventContext.Provider value={{ events, getEvents, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

export default EventContextProvider;