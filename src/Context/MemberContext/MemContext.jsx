import React, { createContext, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../Firebase_config';

export const MemberContext = createContext();

const MemContext = ({children}) => {

  const collectionRef = collection(db, 'Members');

  const [members, setMembers] = useState([]);

    const getMembers = async () => {
          const data = await getDocs(collectionRef);
          const membersData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
          setMembers(membersData);
    }

  return (
    <MemberContext.Provider value={{members, getMembers,setMembers}}>
      {children}
    </MemberContext.Provider>
  )
}

export default MemContext