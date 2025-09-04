import React, { useState, useRef } from 'react';
import './App.css';

const App = () => {
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    linkDaImagemGoogleDrive: '',
    linkMusicaGoogleDrive: '',
  });

  // useRef para manter a referência do áudio tocando no momento
  const audioRef = useRef(null);
  const [currentPlayingCardId, setCurrentPlayingCardId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Função para converter o link de compartilhamento do Google Drive em um link direto
  const convertGoogleDriveLink = (url) => {
    const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    // Retorna a URL original se não for um link válido do Drive
    return url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.linkDaImagemGoogleDrive || !formData.linkMusicaGoogleDrive) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Converte os links do Google Drive para links diretos
    const directImageUrl = convertGoogleDriveLink(formData.linkDaImagemGoogleDrive);
    const directMusicUrl = convertGoogleDriveLink(formData.linkMusicaGoogleDrive);

    const newCard = {
      id: Date.now(),
      nome: formData.nome,
      imagem: directImageUrl,
      musicaUrl: directMusicUrl,
    };

    setCards([...cards, newCard]);
    setFormData({ nome: '', linkDaImagemGoogleDrive: '', linkMusicaGoogleDrive: '' });
  };

  const handleCardClick = (cardId, musicaUrl) => {
    // Se o card clicado já estiver tocando, reinicia a música
    if (currentPlayingCardId === cardId && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    // Se outra música estiver tocando, para ela
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Toca a nova música
    const audio = new Audio(musicaUrl);
    audioRef.current = audio;
    // Tratamento de erro caso o link do áudio falhe
    audio.addEventListener('error', () => {
        alert("Não foi possível carregar o áudio. Verifique se o link do Google Drive está correto e compartilhado publicamente.");
        setCurrentPlayingCardId(null);
    });
    audioRef.current.play();
    setCurrentPlayingCardId(cardId);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crie seu Card de Música Interativo com Google Drive</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="card-form">
          <input
            type="text"
            name="nome"
            placeholder="Nome para o card"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="linkDaImagemGoogleDrive"
            placeholder="Link da Imagem do Google Drive"
            value={formData.linkDaImagemGoogleDrive}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="linkMusicaGoogleDrive"
            placeholder="Link da Música (MP3) do Google Drive"
            value={formData.linkMusicaGoogleDrive}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Criar Card</button>
        </form>
        <div className="card-container">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`interactive-card ${currentPlayingCardId === card.id ? 'playing' : ''}`}
              onClick={() => handleCardClick(card.id, card.musicaUrl)}
            >
              <img src={card.imagem} alt={card.nome} onError={(e) => { e.target.onerror = null; e.target.src="URL_IMAGEM_PADRAO_SE_FALHAR"; alert("Erro ao carregar a imagem. Verifique o link e a permissão de compartilhamento.") }}/>
              <div className="card-overlay">
                <div className="play-icon">▶</div>
              </div>
              <h3>{card.nome}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;