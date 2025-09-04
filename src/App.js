import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Insira suas credenciais do Spotify aqui
const SPOTIFY_CLIENT_ID = 'aa7423f25bf7431ca54bc8bdc9f605ce';
const SPOTIFY_CLIENT_SECRET = '0a315677f87a41f682bbd3544d4c37c9';

const App = () => {
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    linkDaImagem: '',
    linkMusicaSpotfy: '',
  });
  const [spotifyToken, setSpotifyToken] = useState('');

  // Efeito para obter o token de acesso da API do Spotify ao carregar o app
  useEffect(() => {
    const fetchSpotifyToken = async () => {
      try {
        const response = await axios('https://accounts.spotify.com/api/token', {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
          },
          data: 'grant_type=client_credentials',
          method: 'POST',
        });
        setSpotifyToken(response.data.access_token);
      } catch (error) {
        console.error("Erro ao autenticar com o Spotify", error);
      }
    };

    fetchSpotifyToken();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para extrair o ID da música a partir do link do Spotify
  const getTrackIdFromUrl = (url) => {
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/');
      return parts[parts.length - 1];
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.linkDaImagem || !formData.linkMusicaSpotfy) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const trackId = getTrackIdFromUrl(formData.linkMusicaSpotfy);
    if (!trackId) {
      alert('O link da música do Spotify parece ser inválido.');
      return;
    }

    try {
      const trackInfo = await axios(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${spotifyToken}` },
      });

      // NOVO: Salva o link oficial da música no Spotify
      const newCard = {
        id: Date.now(),
        nome: formData.nome,
        imagem: formData.linkDaImagem,
        spotifyUrl: trackInfo.data.external_urls.spotify, // Link para abrir no Spotify
      };

      setCards([...cards, newCard]);
      setFormData({ nome: '', linkDaImagem: '', linkMusicaSpotfy: '' });
    } catch (error) {
      console.error('Erro ao buscar dados da música:', error);
      alert('Não foi possível obter os dados da música. Verifique o link e tente novamente.');
    }
  };

  // ALTERADO: Função de clique agora abre o link do Spotify em uma nova aba
  const handleCardClick = (spotifyUrl) => {
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crie seu Card de Música Interativo</h1>
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
            name="linkDaImagem"
            placeholder="URL da Imagem"
            value={formData.linkDaImagem}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="linkMusicaSpotfy"
            placeholder="Link da Música do Spotify"
            value={formData.linkMusicaSpotfy}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Criar Card</button>
        </form>
        <div className="card-container">
          {cards.map((card) => (
            // A chamada onClick foi atualizada para usar a nova função
            <div
              key={card.id}
              className="interactive-card"
              onClick={() => handleCardClick(card.spotifyUrl)}
            >
              <img src={card.imagem} alt={card.nome} />
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