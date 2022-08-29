import React, { useEffect, useState } from "react";
import {
  Button,
  InfiniteScrollTable,
  Select,
  Textarea,
} from "@contentstack/venus-components";
import { getEntries, Stack } from "../api/contentstack";
import { table } from "console";

interface option {
  id: number;
  label: string;
  value: string;
  schema: {};
}

interface log {
  title: string;
  id: string;
  notice: string;
  status: number;
}

export default function PageOptions() {
  const [contentType, setContentType] = useState<any>({});
  const [contentTypes, setContentTypes] = useState<option[]>([]);

  const [fromFields, setFromFields] = useState<any[]>([]);
  const [fromField, setFromField] = useState<string>("");
  const [toField, setToField] = useState<string>("");
  const [options, setOptions] = useState<option[]>([]);
  const [fields, setFields] = useState<option[]>([]);

  const [tableData, setTableData] = useState<log[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [itemStatusMap, setItemStatusMap] = useState<any[]>([]);

  const management_token: string = process.env.REACT_APP_CS_MANAGEMENT_TOKEN || "";
  const environment: string = process.env.REACT_APP_CS_ENVIRONMENT || "";
  const api_key: string = process.env.REACT_APP_CS_API_KEY || "";

  const updateContentType = (data: any) => {
    setContentType(data);
    updateFieldList(data);
  };

  function updateFieldList(data: any) {
    let schema = data.schema.schema;
    for (let i = 0; i < schema.length; i++) {
      let option = {
        id: data.id,
        label: schema[i].display_name,
        value: schema[i].uid,
      };
      setFromFields((fromFields) => [...fromFields, option]);
    }
  }

  const updateFromField = (data: any) => {
    setFromField(data);
  };

  const updateToField = (data: any) => {
    setToField(data);
  };

  async function migrateField(e: any) {
    e.preventDefault();
    let entries = await getEntries(contentType.value);
    for (let i in entries) {
      let entry = entries[i];
      await updateField(entry);
      fetchTableData();
    }
  }

  async function updateField(entry: any) {
    let locale_code: string = "en-us";
    let entry_uid: string = entry.uid;
    var axios = require("axios");
    var data = JSON.stringify({
      entry: {
        from_field: entry.fromField,
        to_field: entry.toField,
      },
    });

    let config = {
      method: "put",
      url: `https://api.contentstack.io/v3/content_types/${contentType.value}/entries/${entry_uid}?locale=${locale_code}`,
      headers: {
        api_key: api_key,
        authorization: management_token,
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios(config)
      .then(function (response: any) {
        let log = {
          title: entry.title,
          id: entry.uid,
          notice: response.data.notice,
          status: response.status,
        };
        console.log(log);
        setTableData((tableData) => [...tableData, log]);
      })
      .then(() => {
        setLoading(false);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }

  const fetchTableData = () => {
    setLoading(true);
    for (let i = 0; i <= 30; i++) {
      itemStatusMap[i] = "loading";
    }
    setTableData(tableData);
    for (let i = 0; i <= 30; i++) {
      itemStatusMap[i] = "loaded";
    }
    setItemStatusMap(itemStatusMap);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Stack.getContentTypes().then((res) => {
        let contentTypes = res.content_types;
        for (let i = 0; i < contentTypes.length; i++) {
          let contentType = contentTypes[i];
          let option: option = {
            id: i,
            label: contentType.title,
            value: contentType.uid,
            schema: contentType,
          };

          setContentTypes((contentTypes) => [...contentTypes, option]);
        }
      });
    };
    fetchData();
  }, []);

  const columns = [
    {
      Header: "Title",
      accessor: "title",
      id: "title",
    },
    {
      Header: "Entry UID",
      accessor: "id",
      id: "id",
    },
    {
      Header: "Notice",
      accessor: "notice",
      id: "notice",
    },
    {
      Header: "Status",
      accessor: "status",
      id: "status",
    },
  ];

  return (
    <div>
      <Select
        selectLabel="Select Content Type"
        options={contentTypes}
        value={contentType}
        onChange={updateContentType}
      />
      {contentType && (
        <Select
          selectLabel="Select From Field"
          options={fromFields}
          value={fromField}
          onChange={updateFromField}
        />
      )}
      {fromField && (
        <Select
          selectLabel="Select To Field"
          options={fromFields}
          value={toField}
          onChange={updateToField}
        />
      )}
      {toField && (
        <span>
          <Button
            buttonType="primary"
            icon="MarketplaceSmallFilledWhite"
            iconAlignment={undefined}
            onClick={(e: any) => migrateField(e)}
          >
            Migrate
          </Button>
        </span>
      )}
      {true && (
        <InfiniteScrollTable
          columns={columns}
          itemStatusMap={itemStatusMap}
          loading={false}
          data={tableData}
          fetchTableData={fetchTableData}
          loadMoreItems={() => undefined}
          searchPlaceholder="Search"
          totalCounts={tableData.length}
          uniqueKey="id"
          tableHeight={500}
        />
      )}
    </div>
  );
}
