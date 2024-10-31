import './Config.css';
import Routes from "./Routes";
import { useEffect, useContext } from 'react';
import { AppContext } from './AppContext';
import { database, ref, update } from './services/firebaseConfig';

function App() {
  const { userUid } = useContext(AppContext);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        //console.log("A aba está fora de foco ou foi fechada.");

        const status = { status: "offline" };
        if (userUid) {
          const userRf = ref(database, `/user/${userUid}`);
          update(userRf, status)
            .then(() => console.log(`O usuário ${userUid} está deslogado`))
            .catch(error => console.error("Erro ao atualizar status:", error));
        }
      } else {
        const status = { status: "online" };
        if (userUid) {
          const userRf = ref(database, `/user/${userUid}`);
          update(userRf, status)
            .then(() => console.log(`O usuário ${userUid} está logado`))
            .catch(error => console.error("Erro ao atualizar status:", error));
        }
        //console.log("A aba está ativa.");
      }
    };

    if (userUid) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Remove o listener quando o componente é desmontado ou userUid muda
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userUid]); // Adiciona userUid como dependência para que o efeito seja executado quando ele muda

  return (
    <div className="App">
      <Routes />
    </div>
  );
}

export default App;


