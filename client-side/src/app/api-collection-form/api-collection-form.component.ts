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
  editMode: boolean = false;

  ngOnInit(): void {
    console.log("incoming", this.incoming);
    if (this.incoming.collection) {
      this.collection = this.incoming.collection;
      this.editMode = true;
    }
    else {
      this.editMode = false
      this.collection = {
        Name: "",
        Description: "",
        Spec: {"openapi":"3.0.0","paths":{"/accounts":{"get":{"summary":"accounts","description":"This is an endpoint to retreive all account in Pepperi's system","responses":{"200":{"description":"OK"}},"parameters":[{"name":"Fields","schema":{"type":"string"},"description":"List of fields (comma seperated) to retrieve from the object","in":"query","value":"UUID,Name"},{"name":"page","schema":{"type":"integer","minimum":0},"description":"page number to retrieve (zero based)","in":"query"},{"name":"page_size","schema":{"type":"integer","minimum":-1},"description":"number of items each page contains","in":"query"},{"name":"where","schema":{"type":"string"},"description":"where clause to filter returned objects","in":"query"},{"name":"include_deleted","schema":{"type":"boolean"},"description":"wether to retrieve hidden items","in":"query"},{"name":"include_count","schema":{"type":"boolean"},"description":"returns on the headers the number of objects exists in the system","in":"query"}],"tags":["Accounts"]}}},"info":{"title":"My Accounts","version":"1"}}
      }
    }
  }

  save() {
    this.dialogRef.close(this.collection);
  }

  close() {
    this.dialogRef.close()
  }

}
