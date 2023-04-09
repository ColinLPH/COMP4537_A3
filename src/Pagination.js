import React from "react";
import "./style.css"

function Pagination({ pokemons, currentPage, setCurrentPage }) {
    const pageSize = 10;
    const numPages = Math.ceil(pokemons.length / pageSize);

    function skipFive(direction) {
        let amt = 5;
        if (direction === "backward") {
            amt = -5;
        }

        if (currentPage + amt > numPages) {
            setCurrentPage(numPages);
        } 
        else if (currentPage + amt < 1) 
        {
            setCurrentPage(1);
        }
        else
        {
            setCurrentPage(currentPage + amt);
        }
    }

    return (
        <div className="btnBar">

            <button
                onClick={() => setCurrentPage(1)}
            >
                first
            </button>

            <button
                onClick={() => skipFive("backward")}
            >
                prev 5
            </button>

            <button
                onClick={() => { if (currentPage > 1) { setCurrentPage(currentPage - 1) } }}
            >
                prev
            </button>

            { //show ten buttons at a time
                Array.from(Array(numPages)
                    .keys()).map((page) => {
                        if (page + 1 >= currentPage - 5 && page + 1 <= currentPage + 5) {  
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page + 1)}
                                    className={currentPage === page + 1 ? "btnActive" : ""}
                                >
                                    {page + 1}
                                </button>
                            )
                        }
                    })

            }
            <button
                onClick={() => { if (currentPage < numPages) { setCurrentPage(currentPage + 1) } }}
            >
                next
            </button>

            <button
                onClick={() => skipFive("forward")}
            >
                next 5
            </button>

            <button
                onClick={() => setCurrentPage(numPages)}
            >
                last
            </button>

        </div>
    )
}

export default Pagination;