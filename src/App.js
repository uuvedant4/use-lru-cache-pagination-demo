import { useState, useEffect } from "react";
import { useLRUCache } from "use-lru-cache";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const { get, put, getCachedData } = useLRUCache(3);
  const [loading, setLoading] = useState(false);
  const [cachedPages, setCachedPages] = useState([]);

  const getProducts = async () => {
    const data = get(page);
    if (data) {
      setCachedPages(getCachedData());
      setProducts(data);
      return;
    }
    setLoading(true);
    const response = await fetch(
      `https://dummyjson.com/products?limit=10&skip=${(page - 1) * 10}`
    );
    const { products } = await response.json();
    put(page, products);
    setCachedPages(getCachedData());
    setProducts(products);
    setLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, [page]);

  return (
    <div className="container">
      <div className="cached-data">
        <h4>Cached Pages</h4>
        <div className="cached-pages-container">
          {cachedPages?.map((cachedPage, id) => {
            return (
              <div className="cached-page-container" key={cachedPage}>
                <div className="cached-page">{cachedPage}</div>
                <span className="cache-type">
                  {id === 0
                    ? "MRU"
                    : id === cachedPages.length - 1
                    ? "LRU"
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {!loading ? (
        <div className="products">
          {products &&
            products.map((product) => {
              return (
                <div className="product" key={product.id}>
                  <img alt={product.title} src={product?.images[0]} />
                  <span>{product.title} </span>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="loading-products">
          <h4 className="loading">Loading...</h4>
        </div>
      )}
      <Pagination page={page} setPage={setPage} />
    </div>
  );
}

export const Pagination = ({ page, setPage }) => {
  return (
    <div className="pagination">
      <span
        style={{
          opacity: `${page === 1 ? "0.7" : ""}`,
          cursor: `${page === 1 ? "not-allowed" : ""}`,
        }}
        onClick={() => setPage((prev) => (prev !== 1 ? prev - 1 : prev))}
      >
        {"<"}
      </span>
      {[...Array(10)].map((val, id) => {
        return (
          <span
            style={{ backgroundColor: `${page === id + 1 ? "grey" : ""}` }}
            onClick={() => setPage(id + 1)}
            key={id}
          >
            {id + 1}
          </span>
        );
      })}
      <span
        style={{
          opacity: `${page === 10 ? "0.7" : ""}`,
          cursor: `${page === 10 ? "not-allowed" : ""}`,
        }}
        onClick={() => setPage((prev) => (prev !== 10 ? prev + 1 : prev))}
      >
        {">"}
      </span>
    </div>
  );
};

export default App;
