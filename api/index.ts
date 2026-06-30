var express = require("express");
var request = require("request");

var app = express();

app.get("/medicaldevice", function (req: any, res: any) {
  let { PRDUCT_PRMISN_NO, pageNo, numOfRows, type } = req.query;

  // 🔹 공공데이터포털에서 제공하는 Decoding Key 사용
  const serviceKey =
    "342iLtlRTgdRpT0t9aacY4qHIuATbW7Syx0EmvFATsVtKW6dQqosaoXeZNw448rBG8UjZeQQVGL52bkm97F2+g=="; // Decoding Key

  if (!serviceKey || !PRDUCT_PRMISN_NO) {
    res.status(400).json({ error: "serviceKey 및 PRDUCT_PRMISN_NO가 필요합니다." });
    return;
  }

  // 🔹 PRDUCT_PRMISN_NO 값 자동 변환 (숫자만 입력되었을 경우 변환)
  if (/^\d{2,5}-\d{2,5}$/.test(PRDUCT_PRMISN_NO)) {
    PRDUCT_PRMISN_NO = `${PRDUCT_PRMISN_NO} `;
    console.log(`🔄 변환된 PRDUCT_PRMISN_NO: ${PRDUCT_PRMISN_NO}`);
  }

  // 🔹 API 엔드포인트 설정
  var api_url = "https://apis.data.go.kr/1471000/MdlpPrdlstPrmisnInfoService05/getMdlpPrdlstPrmisnItem04";

  var options = {
    url: api_url,
    qs: {
      serviceKey: serviceKey, // API 키
      pageNo: pageNo || 1, // 기본값 설정 (페이지 번호)
      numOfRows: numOfRows || 10, // 기본값 설정 (한 페이지당 결과 수)
      type: "xml", // XML 응답 요청
      PRDUCT_PRMISN_NO: PRDUCT_PRMISN_NO, // 변환된 값 적용
    },
    headers: {
      "Accept": "application/xml",
    },
  };

  console.log("🔍 API 요청 URL:", options.url);
  console.log("🔍 요청 파라미터:", options.qs);

  request.get(options, function (error: Error | null, response: any, body: any) {
    if (error) {
      console.error("❌ 요청 실패:", error.message);
      res.status(500).json({ error: "외부 API 요청 실패", details: error.message });
      return;
    }

    if (!response) {
      console.error("❌ 응답 없음: 서버에서 응답이 없습니다.");
      res.status(500).json({ error: "응답 없음", details: "API 서버에서 응답이 없습니다." });
      return;
    }

    if (response.statusCode !== 200) {
      console.error(`❌ API 오류: 상태 코드 ${response.statusCode}`);
      console.error("🔹 응답 본문:", body);
      res.status(response.statusCode).json({
        error: `API 오류 - 상태 코드 ${response.statusCode}`,
        details: body,
      });
      return;
    }

    // 🔹 XML 데이터를 그대로 반환
    console.log("✅ API 응답 성공!");
    res.writeHead(200, { "Content-Type": "application/xml;charset=utf-8" });
    res.end(body);
  });
});

// 🔹 서버 실행 시 API 테스트 URL 출력
app.listen(3000, function () {
    const baseUrl = "http://127.0.0.1:3000/medicaldevice";
    const params = `pageNo=1&numOfRows=3&type=xml&PRDUCT_PRMISN_NO=${encodeURIComponent("제허 25-74 호")}`;
    console.log("🚀 서버 실행 중...");
    console.log(`📌 API 테스트 URL: ${baseUrl}?${params}`);
  });
