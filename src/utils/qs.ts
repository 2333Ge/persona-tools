const qs = {
  stringify: (obj: Record<string, any>): string => {
    if (!obj) return "";

    return Object.entries(obj)
      .filter(([_, value]) => value != null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map(
              (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
            )
            .join("&");
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join("&");
  },
};

export default qs;
