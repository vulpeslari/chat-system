import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database, ref, onValue } from '../services/firebaseConfig';
import './styles/UserAndChat.css';
import { LineWave } from 'react-loader-spinner';

const User = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = () => {
      const userRef = ref(database, `/user/${userId}`);
      onValue(userRef, (snapshot) => { // Use onValue para escutar mudanças
        const data = snapshot.val();
        setUserData(data);
      });
    };

    fetchUserData();
  }, [userId]);

  return (
    <div className='user-config-box'>
      <h1>Configurações do Usuário</h1>
      <div className='user-config'>
        <img className="user-icon" src="/img/user-icon.jpg" alt="User" />
        <div className='user-info'>
          {userData ? (
            <>
              <h2>{userData.nome}</h2>
              <h2>{userData.email}</h2>
            </>
          ) : (
            <div className='loading'>
              <LineWave
                visible={true}
                height="130"
                width="130"
                color="var(--orange)"
                ariaLabel="line-wave-loading"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
