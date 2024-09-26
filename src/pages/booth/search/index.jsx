import SearchHeader from "components/booth/SearchHeader";
import { useEffect, useState } from "react";
import { RecommandHeader, RecommandTitle } from "../../../boothStyle";
import RecomandRowCard from "components/booth/RecomandRowCard";
import { useTrail, useSpring, animated, useTransition } from "react-spring";
import BoothCard from "components/booth/BoothCard";
import {
  BoothCardGridWrapper,
  RecommandWrapper,
  SearchContentHeader,
  SearchContentWrapper,
  SearchNoResult,
  RecomandBoothWrapper,
  RecommandBoothTitle,
  SearchContainer
} from "../../../search_style";
import { API } from "@/pages/api";

function Search() {
  const [booth, setBooth] = useState([]);
  const [recomandBooth, setRecomandBooth] = useState([]);
  const [randomBooth, setRandomBooth] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (searchValue === "") {
      fetchBoothData();
    } else {
      fetchBooths();
    }
  }, [searchValue]);

  const fetchBoothData = async () => {
    try {
      const [recomandRes, randomRes, boothRes] = await Promise.all([
        API.get("/store/top"),
        API.get("/store/random"),
        API.get("/store/list"),
      ]);

      setRecomandBooth(recomandRes.data);
      setRandomBooth(randomRes.data);
      setBooth(boothRes.data);
    } catch (error) {
      console.error("Error fetching booth data: ", error);
    }
  };

  const fetchBooths = async () => {
    try {
      const response = await API.get(`/store/list`);
      setBooth(response.data);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const renderTopBooth = () => {
    const trail = useTrail(3, {
      from: { opacity: 0, transform: "translateY(20px)" },
      to: { opacity: 1, transform: "translateY(0)" },
      leave: { opacity: 0, transform: "translateY(20px)" },
      delay: 200,
    });

    const fadeOut = useSpring({
      opacity: searchValue.length === 0 ? 1 : 0,
      config: { duration: 300 },
    });

    return (
      <>
        <animated.div style={fadeOut}>
          {searchValue.length === 0 && (
            <RecommandHeader>
              <RecommandTitle>실시간 인기 부스</RecommandTitle>
              {recomandBooth.length > 0 ? (
                trail.map((props, idx) => (
                  <animated.div key={idx} style={props}>
                    <RecomandRowCard
                      ranking={idx}
                      id={recomandBooth[idx].id}
                      logoImage={recomandBooth[idx].logo_image}
                      boothName={recomandBooth[idx].name}
                      boothOperator={recomandBooth[idx].operator}
                      boothLocation={recomandBooth[idx].location}
                      likeCnt={recomandBooth[idx].like_cnt}
                      is_liked={recomandBooth[idx].is_liked}
                    />
                  </animated.div>
                ))
              ) : (
                <p style={{ marginTop: "30px", fontWeight: "500" }}>
                  현재 인기 부스가 없습니다.
                </p>
              )}
            </RecommandHeader>
          )}
        </animated.div>
        {searchValue.length > 0 && renderSearchBooth()}
      </>
    );
  };

  const renderSearchBooth = () => {
    const filteredBooths = booth.filter((b) =>
      ["name", "type", "operator", "location"].some((key) =>
        isPartialMatch(b[key], searchValue)
      )
    );

    const transition = useTransition(filteredBooths, {
      from: { opacity: 0, transform: "translateY(20px)" },
      enter: { opacity: 1, transform: "translateY(0)" },
      leave: { opacity: 0, transform: "translateY(20px)" },
      config: { duration: 300 },
      keys: filteredBooths.map((b) => b.id),
    });

    return (
      <SearchContentWrapper>
        <SearchContentHeader>'{searchValue}' 검색결과</SearchContentHeader>
        {filteredBooths.length === 0 ? (
          <SearchNoResult>검색 결과가 없습니다.</SearchNoResult>
        ) : (
          <BoothCardGridWrapper>
            {transition((style, item) => (
              <animated.div style={style} key={item.id}>
                <BoothCard {...item} />
              </animated.div>
            ))}
          </BoothCardGridWrapper>
        )}
        <RecommandBoothTitle>이런 부스는 어때요?</RecommandBoothTitle>
        <RecomandBoothWrapper>
          {useTrail(randomBooth.slice(0, 2).length, {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
            leave: { opacity: 0, transform: "translateY(20px)" },
            delay: 200,
          }).map((style, index) => (
            <animated.div key={index} style={style}>
              <BoothCard {...randomBooth[index]} />
            </animated.div>
          ))}
        </RecomandBoothWrapper>
      </SearchContentWrapper>
    );
  };

  function isPartialMatch(value, search) {
    if (!search) return true;
    const regex = search.split("").map((char) => `(?=.*${char})`).join("");
    return new RegExp(regex).test(value.toLowerCase());
  }

  return (
    <SearchContainer>
      <SearchHeader searchValue={searchValue} setSearchValue={setSearchValue} />
      {renderTopBooth()}
    </SearchContainer>
  );
}

export default Search;
