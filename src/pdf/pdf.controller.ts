import { Body, Controller, Get, Header, HttpCode, Param, Post, Query, Render, Req, Res } from '@nestjs/common';
import { PdfService } from './pdf.service';
import * as puppeteer from 'puppeteer';
import {query, Request} from 'express';
import * as path from 'path';
import fs from 'fs'

import { Response } from 'express';
import { pdfDto } from './dtos/pdf.dtos';
@Controller('pdf')
export class PdfController {

  constructor(private readonly pdfService: PdfService) { }

  @Get('get')
  @Render('index')
  async getPdf(@Req() req: Request ,  @Query() query:pdfDto) {
    console.log(req.query);

    console.log("nest q" + query.pass);
    
    const dto = req.query;
    console.log(dto);
    
    // console.log(id + "  " + pass);
    // console.log(idpass);
    
    // return idpass;
    console.log("DTOS form quary" + dto.id.toString() , dto.pass.toString());
    

    return await this.pdfService.getPDF(dto.id.toString() , unescape(dto.pass as string));
  }



  @Post()
  // @HttpCode(201)
  // @Header('Content-Type', 'image/pdf')
  // @Header('Content-Disposition', 'attachment; filename=test.pdf')
  async genPdf(@Res() res: Response,@Body() body : pdfDto) {

console.log(body);

    const buffer = await this.pdfService.genPDF(body);
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=routine.pdf',
      'Content-Length': buffer.length,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 0,
    })

    res.end(buffer)



    // (async () => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();

    //     // await page.setViewport({
    //     //     width: 3000,
    //     //     height: 2000,
    //     //     deviceScaleFactor: 1,
    //     //   });
    //     await page.goto('https://google.com');
    //     // await page.waitForNavigation({
    //     //     waitUntil: 'networkidle0',
    //     //   });

    //     //   await page.waitForSelector('.cd-schedule__events', {
    //     //     visible: true,
    //     //   });

    //     await page.pdf({ path: 'google.pdf' });

    //     await browser.close();
    // })();


  }


}
