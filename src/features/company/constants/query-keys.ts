export const companyKeys = {
  all: ["company"] as const,
  public: () => [...companyKeys.all, "public"] as const,
};
