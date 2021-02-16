import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  instructions: string[] = [
    'https://www.youtube.com/embed/kPOnXeOjl0E',
    'https://www.youtube.com/embed/1-Qd2LZyWh0',
    'https://www.youtube.com/embed/uL_XRNVZk_s',
    'https://www.youtube.com/embed/a9mU3U9g1Mo',
    'https://www.youtube.com/embed/sLyngb8lN_Q',
    'https://www.youtube.com/embed/KhBtg7zBANI'
  ];

  ngOnInit(): void { }

  downloadWork(work: number): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `../../../reports/work${work}.pdf`);
    link.setAttribute('download', `work${work}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
