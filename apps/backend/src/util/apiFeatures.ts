import type { Query, Document, Model } from "mongoose";

interface QueryString {
  name?: string;
  limit?: string;
  page?: string;
  [key: string]: string | undefined; // for dynamic filters like price[gte]
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    resPerPage: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class APIFeatures<T extends Document> {
  query: Query<T[], T>;
  queryStr: QueryString;
  countQuery: Promise<number> | null;
  resPerPage: number | null;
  currentPage: number | null;

  constructor(query: Query<T[], T>, queryStr: QueryString) {
    this.query = query;
    this.queryStr = queryStr;
    this.countQuery = null;
    this.resPerPage = null;
    this.currentPage = null;
  }

  search(): this {
    const keyword = this.queryStr.name
      ? {
          name: {
            $regex: this.queryStr.name,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter(): this {
    const queryCopy: QueryString = { ...this.queryStr };
    const removeFields: (keyof QueryString)[] = ["name", "limit", "page"];
    removeFields.forEach((el) => delete queryCopy[el]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resPerPage: number): this {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.countQuery = this.query.model.countDocuments(
      this.query.getQuery(),
    ) as unknown as Promise<number>;
    this.resPerPage = resPerPage;
    this.currentPage = currentPage;

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }

  async execute(): Promise<PaginationResult<T>> {
    const [totalCount, data] = await Promise.all([this.countQuery, this.query]);

    const totalPages = Math.ceil((totalCount as number) / this.resPerPage!);

    return {
      data: data as T[],
      pagination: {
        currentPage: this.currentPage!,
        resPerPage: this.resPerPage!,
        totalCount: totalCount as number,
        totalPages,
        hasNextPage: this.currentPage! < totalPages,
        hasPrevPage: this.currentPage! > 1,
      },
    };
  }
}
