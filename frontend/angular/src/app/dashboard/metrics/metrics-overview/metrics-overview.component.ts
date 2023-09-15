import {Component} from '@angular/core';
import {MetricsApiService} from "../api/metrics-api.service";

@Component({
  selector: 'app-metrics-overview',
  templateUrl: './metrics-overview.component.html',
  styleUrls: ['./metrics-overview.component.scss']
})
export class MetricsOverviewComponent {
  constructor(private metricsApi: MetricsApiService) {
  }

  ngOnInit() {
    this.metricsApi.fetchData("CPU")
      .then((data) => console.log(data));
  }
}
