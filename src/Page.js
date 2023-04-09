import React, { useState } from 'react';
import './pageStyle.css';
import Popup from './Popup';

function Page({ pokemons, currentPage }) {
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPokemons = pokemons.slice(startIndex, endIndex);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  function zeroes(num) {
    if (num < 10) {
      return '00';
    } else if (num < 100) {
      return '0';
    } else {
      return '';
    }
  }

  function handlePokemonClick(pokemon) {
    setSelectedPokemon(pokemon);
    setShowPopup(true);
  }

  return (
    <div className='page'>
      <div id='title'>Pokedex</div>

      <div className='pokedex'>
        {currentPokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className='pokemon_container'
            onClick={() => handlePokemonClick(pokemon)}
          >
            <>#{zeroes(pokemon.id)}
            {pokemon.id} {pokemon.name.english}</>
            <img
              src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${zeroes(pokemon.id)}${pokemon.id}.png`}
              alt={pokemon.name.english}
            />
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <Popup
          pokemon={selectedPokemon}
          onClose={() => {
            setSelectedPokemon(null);
            setShowPopup(false);
          }}
          showPopup={showPopup}
        />
      )}
    </div>
  );
}

export default Page;
