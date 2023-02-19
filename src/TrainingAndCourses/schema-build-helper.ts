import moment from "moment";
import { v4 as uuid } from "uuid";
import { ITrainingNetworkContext } from "./schema";
export const buildContext = (input: any = {}) => {
  const context: ITrainingNetworkContext = {
    transaction_id: input?.transactionId ?? uuid(),
    domain: `${process.env.DOMAIN}${input?.category ?? "courses"}`,
    country: process.env.COUNTRY || (input?.country ?? ""),
    city: process.env.CITY || (input?.city ?? ""),
    action: input.action ?? "",
    version: `${process.env.CORE_VERSION || (input?.core_version ?? "")}`,
    bap_id: process.env.BAP_ID || (input?.bapId ?? ""),
    bap_uri: process.env.BAP_URI || (input?.bapUri ?? ""),
    bpp_id: input?.bppId,
    bpp_uri: input?.bppUri,
    message_id: input?.messageId ?? uuid(),
    timestamp: input.timestamp ?? moment().toISOString()
  };
  return context;
};

export const buildSearchRequest = (input: any = {}) => {
  const context = buildContext({ action: "search", category: "courses" });
  const message: any = {
    intent: {}
  };
  let item: any = {};
  let provider: any = {};
  let category: any = {};
  if (input?.category) {
    category = {
      descriptor: {
        name: input?.category
      }
    };
  }

  if (input?.provider) {
    provider = {
      descriptor: {
        name: input?.provider
      }
    };
  }
  if (input?.deepSearch && input?.deepSearch.length) {
    item.tags = [];
    item.tags = input?.deepSearch.map((query: any) => {
      return {
        display: false,
        name: query?.searchCriteria,
        list: query?.searchParameters
      };
    });
  }
  if (input?.searchTitle) {
    item = {
      ...item,
      descriptor: {
        name: input?.searchTitle
      }
    };
  }

  if (Object.keys(item).length) {
    message.intent = {
      ...message.intent,
      item
    };
  }
  if (Object.keys(provider).length) {
    message.intent = {
      ...message.intent,
      provider
    };
  }
  if (Object.keys(category).length) {
    message.intent = {
      ...message.intent,
      category
    };
  }

  return { payload: { context, message } };
};

export const buildSearchResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input)
    return { status: 200 };
  const { transaction_id: transactionId, message_id: messageId, bpp_id: bppId, bpp_uri: bppUri }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const courses: any[] = [];

  const providers = input?.message?.catalog?.providers;

  providers?.forEach((provider: any) => {
    provider?.items.forEach((item: any) => {
      const categoryFound: any = provider?.categories.find(
        (category: any) => category?.id === item.category_id
      );
      courses.push({
        id: item?.id,
        name: item?.descriptor?.name,
        description: item?.descriptor?.long_desc,
        imageLocations: item?.descriptor?.images.map(
          (img: any) => img?.url || ""
        ),
        duration: item?.time?.duration,
        provider: {
          id: provider?.id,
          name: provider?.descriptor?.name,
          description: provider?.descriptor?.name
        },
        category: {
          id: categoryFound ? categoryFound?.id : "",
          name: categoryFound ? categoryFound?.descriptor?.name : ""
        }
      });
    });
  });
  return { data: { context, courses } };
};

export const buildInitRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "init"
  });
  const message: any = {};

  return { payload: { context, message } };
};

export const buildInitResponse = (response: any = {}, input: any = {}) => {
  const context = {
    transactionId: response?.context?.message_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  const { order = {} } = response?.message;

  return { context };
};

export const buildConfirmRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "confirm"
  });

  return { payload: { context } };
};
export const buildConfirmResponse = (response: any = {}, input: any = {}) => {
  const context = {
    transactionId: response?.context?.message_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  const { order = {} } = response?.message;

  return { context };
};

export const buildStatusRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "confirm"
  });
  const message = {};
  return { payload: { context, message } };
};
export const buildStatusResponse = (response: any = {}, input: any = {}) => {
  const context = {
    transactionId: response?.context?.message_id,
    bppId: response?.context?.bpp_id,
    bppUri: response?.context?.bpp_uri
  };

  return { context };
};

export const buildSelectRequest = (input: any = {}) => {
  const context = buildContext({
    ...input?.context,
    category: "courses",
    action: "select"
  });
  const message = {
    order: { items: [{ id: input?.courseId }] }
  };
  return { payload: { context, message } };
};

export const buildSelectResponse = (response: any = {}, body: any = {}) => {
  const input = response?.data?.responses?.[0];
  if (!input)
    return { status: 200 };

  const { transaction_id: transactionId, message_id: messageId, bpp_id: bppId, bpp_uri: bppUri }: any = input?.context ?? {};
  const context = { transactionId, messageId, bppId, bppUri };

  const provider = input?.message?.order?.provider;
  const item = input?.message?.order?.items?.[0];

  const category: any = provider?.categories?.find((category: any) => category?.id === item?.category_id);

  const course = {
    id: item?.id,
    name: item?.descriptor?.name,
    description: item?.descriptor?.long_desc,
    imageLocations: item?.descriptor?.images?.map((image: any) => image?.url),
    duration: item?.time?.duration,
    provider: {
      id: provider?.id,
      name: provider?.descriptor?.name,
      description: provider?.descriptor?.long_desc
    },
    category: {
      id: category?.id,
      name: category?.name
    }
  };

  let courseDetails = item?.tags?.find((tag: any) => tag?.descriptor?.name == "courseDetails");

  const eligibility = item?.tags?.find((tag: any) => tag?.descriptor?.name == "eligibility");
  const courseHighlights = item?.tags?.find((tag: any) => tag?.descriptor?.name == "courseHighlights");
  const prerequisites = item?.tags?.find((tag: any) => tag?.descriptor?.name == "prerequisites");

  const additionalFormUrl = item?.xinput?.form?.url

  courseDetails = {
    price: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "price")?.value,
    startDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "startDate")?.value,
    endDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "endDate")?.value,
    rating: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "rating")?.value,
    credits: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "credits")?.value,

    instructors: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "instructors")?.value,
    offeringInstitue: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "offeringInstitue")?.value,
    courseUrl: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "url")?.value,
    enrollmentEndDate: courseDetails?.list?.find((detail: any) => detail?.descriptor?.name == "enrollmentEndDate")?.value,

    eligibility: eligibility?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value })),
    courseHighlights: courseHighlights?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value })),
    prerequisites: prerequisites?.list?.map((li: any) => ({ name: li?.descriptor?.name, value: li?.value }))
  }

  return { data: { context, course, courseDetails, additionalFormUrl } };
};
