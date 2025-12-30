import { Component, Input } from '@angular/core';
import { getFileClasses } from '../../../utilities/file-type.styles';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-quick-access-section',
  imports: [CommonModule],
  templateUrl: './quick-access-section.html',
  styleUrl: './quick-access-section.scss',
})
export class QuickAccessSection {
  getFileStyle = getFileClasses
  @Input() title:string = "Frequently Used";
  @Input() files:any[] =  [
  {
    id: '1',
    name: 'Project_Proposal.pdf',
    url: 'https://example.com/files/project_proposal.pdf',
    type: 'pdf',
    size: 245760, // 240 KB
    uploadedAt: new Date('2025-01-05T10:30:00')
  },
  {
    id: '2',
    name: 'Budget_Report.xlsx',
    url: 'https://example.com/files/budget_report.xlsx',
    type: 'xls',
    size: 512000, // 500 KB
    uploadedAt: new Date('2025-01-10T14:15:00')
  },
  {
    id: '3',
    name: 'Team_Presentation.pptx',
    url: 'https://example.com/files/team_presentation.pptx',
    type: 'ppt',
    size: 1048576, // 1 MB
    uploadedAt: new Date('2025-01-15T09:00:00')
  },
  {
    id: '4',
    name: 'Office_Event_Photo.jpg',
    url: 'https://example.com/files/office_event_photo.jpg',
    type: 'image',
    size: 734003, // ~717 KB
    uploadedAt: new Date('2025-01-20T18:45:00')
  }
];
;
  @Input() link:string = "";

  onViewAll(){}

}
