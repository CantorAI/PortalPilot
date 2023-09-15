import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MetricsApiService {

  constructor(private http: HttpClient) {
  }

  public fetchData = async (metricName: string) => {
    let url = "api/metrics?keys=" + metricName + "&object=";
    return this.http.get(url).toPromise();
  };
}
