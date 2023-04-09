import React, { useEffect, useState } from "react";
import axios from "axios";

function Popup({ pokemon, onClose, showPopup }) {
  const [pokemonData, setPokemonData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json"
      );
      const filteredPokemon = result.data.find((p) => p.id === pokemon.id);
      setPokemonData(filteredPokemon);
    };
    fetchData();
  }, [pokemon.id]);

  function zeroes(num) {
    if (num < 10) {
      return "00";
    } else if (num < 100) {
      return "0";
    } else {
      return "";
    }
  }

  return (
    <>
    <div className="popup-backdrop" style={{ display: showPopup ? 'block' : 'none' }} onClick={onClose} />
    <div className="popup" style={{ display: showPopup ? 'block' : 'none' }}>
      <div className="popup-inner">
        <div className="popup-header">
          <h3>{pokemon?.name?.english}</h3>
          <button className="close-btn" onClick={onClose}>
            X
          </button>
        </div>
        <div className="popup-content">
          <div className="popup-image">
            <img
              src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${zeroes(pokemon.id)}${pokemon.id}.png`}
              alt={pokemon?.name?.english}
            />
          </div>
          <div className="popup-details">
            <div>HP: {pokemon?.base?.HP || "-"}</div>
            <div>Attack: {pokemon?.base?.Attack || "-"}</div>
            <div>Defense: {pokemon?.base?.Defense || "-"}</div>
            <div>Sp. Attack: {pokemon?.base['Sp. Attack'] || "-"}</div>
            <div>Sp. Defense: {pokemon?.base['Sp. Defense'] || "-"}</div>
            <div>Speed: {pokemon?.base?.Speed || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default Popup;
