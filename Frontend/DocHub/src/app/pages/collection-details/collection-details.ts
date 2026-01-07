import { FileRow } from '../../models/file-row';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionModel } from '../../models/collection';
import { collection, collections, DefaultFile, dummyFiles } from '../../constants/constants';
import { FileGalleryComponent } from "../../components/file-gallery/file-gallery";
import { ElaticSearchBar } from "../../components/elatic-search-bar/elatic-search-bar";
import { DropdownComponent } from "../../components/dropdown/dropdown";

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [CommonModule, FileGalleryComponent, ElaticSearchBar, DropdownComponent],
  templateUrl: './collection-details.html',
})
export class CollectionDetailsComponent implements OnInit {
  sortby = [
  { id: 1, name: 'Size' },
  { id: 2, name: 'Upload Date' },
  { id: 3, name: 'Name' }
];
  collectionId!: string;

  // Dummy collection (replace with API later)
  collection: CollectionModel|null = null;
  files: FileRow[] = dummyFiles

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.collectionId = params.get('id')!;
      this.fetchCollection(this.collectionId);
    });
  }

  fetchCollection(id: string) {
    this.collection = collection
    this.files = dummyFiles
  }
}
