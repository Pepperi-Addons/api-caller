import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-api-collection-form',
  templateUrl: './api-collection-form.component.html',
  styleUrls: ['./api-collection-form.component.css']
})
export class ApiCollectionFormComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ApiCollectionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public incoming: any
  ) { }

  collection: any = undefined;

  ngOnInit(): void {
    console.log("incoming", this.incoming);
    this.collection = this.incoming.collection;
  }

  save() {
    this.dialogRef.close(this.collection);
  }

  close() {
    this.dialogRef.close()
  }

}
