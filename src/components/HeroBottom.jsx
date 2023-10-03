import React, { useState, useEffect } from "react";
import { PDFDownloadLink, Document, Page, Text } from "@react-pdf/renderer";
import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import TextToSpeech from "./TextToSpeech";
import { languages } from "./languages";

const PDFDocument = ({ summary }) => (
  <Document>
    <Page>
      <Text>{summary}</Text>
    </Page>
  </Document>
);

const HeroBottom = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [length, setLength] = useState(3);
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const existingArticleIndex = allArticles.findIndex(
      (item) => item.url === article.url
    );

    const { data } = await getSummary({
      articleUrl: article.url,
      length,
      lang: selectedLang,
    });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary, length };

      let updatedAllArticles;
      if (existingArticleIndex > -1) {
        updatedAllArticles = [...allArticles];
        updatedAllArticles[existingArticleIndex] = newArticle;
      } else {
        updatedAllArticles = [newArticle, ...allArticles];
      }

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {article.summary !== "" ? <TextToSpeech text={article.summary} /> : null}
      <div className="flex flex-col w-full gap-2">
        <div className="parameterDiv mb-2">
          <div className="parameter1">
            <label>Select no. of paragraphs</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              min="1"
            />
          </div>
          <div className="parameter2">
            <label>Select a language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link-icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            onKeyDown={handleKeyDown}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 "
          >
            <p>↵</p>
          </button>
        </form>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => {
                if (item.length !== length) {
                  setArticle({ url: item.url });
                  handleSubmit();
                } else {
                  setArticle(item);
                }
              }}
              className="link_card"
            >
              <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                  Article <span className="blue_gradient">Summary</span>
                </h2>
                <PDFDownloadLink
                  className="orange_gradient downloadButton"
                  style={{
                    border: "1px solid orange",
                    padding: "5px 15px",
                    fontWeight: "bold",
                  }}
                  document={<PDFDocument summary={article.summary} />}
                  fileName={`${article.url}.pdf`}
                >
                  {({ loading }) =>
                    loading ? "Generating PDF..." : "Download PDF"
                  }
                </PDFDownloadLink>
              </div>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default HeroBottom;
