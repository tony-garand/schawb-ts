export class MockResponse {
  constructor(public data: any, public status: number) {}

  json(): Promise<any> {
    return Promise.resolve(this.data);
  }

  text(): Promise<string> {
    return Promise.resolve(JSON.stringify(this.data));
  }
} 