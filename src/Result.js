import Page from "./Page";
import Pagination from "./Pagination";
import React from "react";
import axios from "axios"; 
import { useEffect, useState } from 'react';

function Result({ selectedTypes }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPokemons, setFilteredPokemons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json');
      setPokemons(result.data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const newFilteredPokemons = 
        selectedTypes.length != 0 
        ? pokemons.filter(pokemon => selectedTypes.every(type => pokemon.type.includes(type)))
        : pokemons;
    setFilteredPokemons(newFilteredPokemons);
  }, [selectedTypes]);

  return (
    <h1>
      <Page
        pokemons={filteredPokemons}
        currentPage={currentPage}
      />
      <Pagination
        pokemons={filteredPokemons}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </h1>
  );
}

export default Result;
