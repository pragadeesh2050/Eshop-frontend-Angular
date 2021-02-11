import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Item } from '../../_models/item';
import { ItemService } from '../../_services/item.service';
import { UploadService } from '@app/_services/upload.service';
import { HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-admin-item-form',
  templateUrl: './admin-item-form.component.html',
  styleUrls: ['./admin-item-form.component.css']
})
export class AdminItemFormComponent implements OnInit {

  @ViewChild('itemForm') public itemForm?: NgForm;
  categories: string[] = ["", "shoes", "clothes", "glasses"];
  mode:string = "new";
  item:Item = new Item(0, "", 0, "", "");
  selectedFile?: ImageSnippet;
  timeStamp?: number = (new Date()).getTime();
  public progress: number = 0;
  public message: string = "";

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private location: Location,
    private router: Router,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.getItem();
  }

//  get diagnostic() { return JSON.stringify(this.item); }

  onSubmit(): void {
    if(this.item.id > 0){
      this.itemService.updateItem(this.item)
      .subscribe(() => {
        this.itemForm?.form.markAsPristine(); //disable Save button again
      });
    }
    else{
      this.itemService.addItem(this.item)
        .subscribe((item) => {
          this.item = item;
          this.itemForm?.form.markAsPristine(); //disable Save button again
        });
    }
  }

  getItem(): void {
    console.log("ID:" + this.route.snapshot.paramMap.get('id'));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(id);
    if(id != 0)
    {
      this.itemService.getItem(id)
      .subscribe(item => this.item = item);   
    }
  }

  goBack(): void {
    this.location.back();
  }   

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      this.uploadService.upload(this.selectedFile.file, this.item.id)
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress)
            this.progress = Math.round(100 * event.loaded / (event.total || 1));
          else if (event.type === HttpEventType.Response) {
            this.message = 'Upload success.';
            this.updateLinkPicture();
          }
        });
    });
    reader.readAsDataURL(file);
  }

  public getLinkPicture() {
    let linkPicture = "https://localhost:44326/MyImages/" + this.item.id + ".png"
    if(this.timeStamp) {
       return linkPicture + '?' + this.timeStamp;
    }
    return linkPicture;
}
  public updateLinkPicture() {
    this.timeStamp = (new Date()).getTime();
  }
}
