export interface LanguageLibrary {
  id: string;
  name: string;
  summary: string;
  snippet: string;
  manifestEntry: string;
}

export interface ManifestDescriptor {
  path: string;
  render: (libraries: readonly LanguageLibrary[]) => string;
}

function library(
  id: string,
  name: string,
  summary: string,
  snippet: string,
  manifestEntry: string,
): LanguageLibrary {
  return { id, name, summary, snippet, manifestEntry };
}

const PYTHON: readonly LanguageLibrary[] = [
  library("numpy", "NumPy", "Arrays and numeric computing.", "import numpy as np", "numpy"),
  library("pandas", "pandas", "Data frames and analysis.", "import pandas as pd", "pandas"),
  library("requests", "Requests", "HTTP client.", "import requests", "requests"),
  library("flask", "Flask", "Web micro framework.", "from flask import Flask", "flask"),
  library("django", "Django", "Full stack web framework.", "import django", "django"),
  library(
    "fastapi",
    "FastAPI",
    "Async web API framework.",
    "from fastapi import FastAPI",
    "fastapi",
  ),
  library(
    "pydantic",
    "Pydantic",
    "Data validation with types.",
    "from pydantic import BaseModel",
    "pydantic",
  ),
  library(
    "sqlalchemy",
    "SQLAlchemy",
    "Database toolkit and ORM.",
    "import sqlalchemy",
    "SQLAlchemy",
  ),
  library(
    "matplotlib",
    "Matplotlib",
    "Plotting and charts.",
    "import matplotlib.pyplot as plt",
    "matplotlib",
  ),
  library("scipy", "SciPy", "Scientific algorithms.", "import scipy", "scipy"),
  library(
    "scikit-learn",
    "scikit-learn",
    "Classic machine learning.",
    "from sklearn import datasets",
    "scikit-learn",
  ),
  library("pytest", "pytest", "Testing framework.", "import pytest", "pytest"),
  library("pillow", "Pillow", "Image processing.", "from PIL import Image", "Pillow"),
  library(
    "beautifulsoup4",
    "BeautifulSoup",
    "HTML parsing.",
    "from bs4 import BeautifulSoup",
    "beautifulsoup4",
  ),
  library("httpx", "HTTPX", "Async HTTP client.", "import httpx", "httpx"),
  library("rich", "Rich", "Formatted terminal output.", "from rich import print", "rich"),
  library("click", "Click", "Command line interfaces.", "import click", "click"),
  library("polars", "Polars", "Fast data frames.", "import polars as pl", "polars"),
  library("tensorflow", "TensorFlow", "Deep learning.", "import tensorflow as tf", "tensorflow"),
  library("torch", "PyTorch", "Deep learning.", "import torch", "torch"),
];

const CPP: readonly LanguageLibrary[] = [
  library(
    "boost",
    "Boost",
    "General purpose library collection.",
    "#include <boost/algorithm/string.hpp>",
    "boost",
  ),
  library("fmt", "fmt", "Modern formatting.", "#include <fmt/core.h>", "fmt"),
  library("spdlog", "spdlog", "Fast logging.", "#include <spdlog/spdlog.h>", "spdlog"),
  library(
    "nlohmann-json",
    "nlohmann/json",
    "JSON for modern C++.",
    "#include <nlohmann/json.hpp>",
    "nlohmann-json",
  ),
  library("eigen", "Eigen", "Linear algebra.", "#include <Eigen/Dense>", "eigen3"),
  library("catch2", "Catch2", "Unit testing.", "#include <catch2/catch_test_macros.hpp>", "catch2"),
  library(
    "googletest",
    "GoogleTest",
    "Unit testing by Google.",
    "#include <gtest/gtest.h>",
    "gtest",
  ),
  library("opencv", "OpenCV", "Computer vision.", "#include <opencv2/opencv.hpp>", "opencv4"),
  library("sqlite3", "SQLite3", "Embedded database.", "#include <sqlite3.h>", "sqlite3"),
  library("asio", "Asio", "Networking and async IO.", "#include <asio.hpp>", "asio"),
  library(
    "abseil",
    "Abseil",
    "Google common libraries.",
    "#include <absl/strings/str_cat.h>",
    "abseil",
  ),
  library(
    "protobuf",
    "Protocol Buffers",
    "Binary serialisation.",
    "#include <google/protobuf/message.h>",
    "protobuf",
  ),
  library("grpc", "gRPC", "Remote procedure calls.", "#include <grpcpp/grpcpp.h>", "grpc"),
  library("cpr", "cpr", "HTTP requests.", "#include <cpr/cpr.h>", "cpr"),
  library("range-v3", "range-v3", "Range algorithms.", "#include <range/v3/all.hpp>", "range-v3"),
  library("sfml", "SFML", "Multimedia and games.", "#include <SFML/Graphics.hpp>", "sfml"),
  library("imgui", "Dear ImGui", "Immediate mode GUI.", "#include <imgui.h>", "imgui"),
  library(
    "pybind11",
    "pybind11",
    "C++ and Python bindings.",
    "#include <pybind11/pybind11.h>",
    "pybind11",
  ),
  library("tbb", "oneTBB", "Parallel algorithms.", "#include <tbb/parallel_for.h>", "tbb"),
  library(
    "poco",
    "POCO",
    "Network and utility classes.",
    "#include <Poco/Net/HTTPClientSession.h>",
    "poco",
  ),
];

const RUST: readonly LanguageLibrary[] = [
  library(
    "serde",
    "serde",
    "Serialisation framework.",
    "use serde::{Serialize, Deserialize};",
    'serde = { version = "1", features = ["derive"] }',
  ),
  library(
    "serde_json",
    "serde_json",
    "JSON support for serde.",
    "use serde_json::json;",
    'serde_json = "1"',
  ),
  library(
    "tokio",
    "tokio",
    "Async runtime.",
    "use tokio::time::sleep;",
    'tokio = { version = "1", features = ["full"] }',
  ),
  library("rand", "rand", "Random numbers.", "use rand::Rng;", 'rand = "0.8"'),
  library("regex", "regex", "Regular expressions.", "use regex::Regex;", 'regex = "1"'),
  library(
    "clap",
    "clap",
    "Command line parsing.",
    "use clap::Parser;",
    'clap = { version = "4", features = ["derive"] }',
  ),
  library(
    "reqwest",
    "reqwest",
    "HTTP client.",
    "use reqwest::Client;",
    'reqwest = { version = "0.12", features = ["json"] }',
  ),
  library("anyhow", "anyhow", "Flexible error handling.", "use anyhow::Result;", 'anyhow = "1"'),
  library(
    "thiserror",
    "thiserror",
    "Error type derivation.",
    "use thiserror::Error;",
    'thiserror = "1"',
  ),
  library(
    "itertools",
    "itertools",
    "Iterator helpers.",
    "use itertools::Itertools;",
    'itertools = "0.13"',
  ),
  library("chrono", "chrono", "Dates and times.", "use chrono::Utc;", 'chrono = "0.4"'),
  library("log", "log", "Logging facade.", "use log::info;", 'log = "0.4"'),
  library(
    "env_logger",
    "env_logger",
    "Logger implementation.",
    "use env_logger;",
    'env_logger = "0.11"',
  ),
  library("axum", "axum", "Web framework.", "use axum::Router;", 'axum = "0.7"'),
  library("actix-web", "actix-web", "Web framework.", "use actix_web::web;", 'actix-web = "4"'),
  library(
    "sqlx",
    "sqlx",
    "Async SQL toolkit.",
    "use sqlx::PgPool;",
    'sqlx = { version = "0.8", features = ["runtime-tokio"] }',
  ),
  library("rayon", "rayon", "Data parallelism.", "use rayon::prelude::*;", 'rayon = "1"'),
  library(
    "uuid",
    "uuid",
    "Unique identifiers.",
    "use uuid::Uuid;",
    'uuid = { version = "1", features = ["v4"] }',
  ),
  library(
    "once_cell",
    "once_cell",
    "Lazy statics.",
    "use once_cell::sync::Lazy;",
    'once_cell = "1"',
  ),
  library("futures", "futures", "Async primitives.", "use futures::StreamExt;", 'futures = "0.3"'),
];

const CSHARP: readonly LanguageLibrary[] = [
  library(
    "newtonsoft-json",
    "Newtonsoft.Json",
    "JSON serialisation.",
    "using Newtonsoft.Json;",
    'Newtonsoft.Json" Version="13.0.3',
  ),
  library("serilog", "Serilog", "Structured logging.", "using Serilog;", 'Serilog" Version="4.0.0'),
  library(
    "automapper",
    "AutoMapper",
    "Object mapping.",
    "using AutoMapper;",
    'AutoMapper" Version="13.0.1',
  ),
  library("dapper", "Dapper", "Micro ORM.", "using Dapper;", 'Dapper" Version="2.1.35'),
  library(
    "entityframeworkcore",
    "EntityFrameworkCore",
    "ORM for .NET.",
    "using Microsoft.EntityFrameworkCore;",
    'Microsoft.EntityFrameworkCore" Version="8.0.8',
  ),
  library("xunit", "xUnit", "Unit testing.", "using Xunit;", 'xunit" Version="2.9.0'),
  library("nunit", "NUnit", "Unit testing.", "using NUnit.Framework;", 'NUnit" Version="4.2.2'),
  library("moq", "Moq", "Mocking framework.", "using Moq;", 'Moq" Version="4.20.70'),
  library(
    "fluentvalidation",
    "FluentValidation",
    "Validation rules.",
    "using FluentValidation;",
    'FluentValidation" Version="11.9.2',
  ),
  library(
    "fluentassertions",
    "FluentAssertions",
    "Readable assertions.",
    "using FluentAssertions;",
    'FluentAssertions" Version="6.12.0',
  ),
  library("polly", "Polly", "Resilience policies.", "using Polly;", 'Polly" Version="8.4.1'),
  library("mediatr", "MediatR", "Mediator pattern.", "using MediatR;", 'MediatR" Version="12.4.0'),
  library(
    "restsharp",
    "RestSharp",
    "HTTP client.",
    "using RestSharp;",
    'RestSharp" Version="112.0.0',
  ),
  library(
    "csvhelper",
    "CsvHelper",
    "CSV reading and writing.",
    "using CsvHelper;",
    'CsvHelper" Version="33.0.1',
  ),
  library(
    "hangfire",
    "Hangfire",
    "Background jobs.",
    "using Hangfire;",
    'Hangfire" Version="1.8.14',
  ),
  library(
    "masstransit",
    "MassTransit",
    "Message bus.",
    "using MassTransit;",
    'MassTransit" Version="8.2.5',
  ),
  library(
    "swashbuckle",
    "Swashbuckle",
    "OpenAPI documents.",
    "using Swashbuckle.AspNetCore;",
    'Swashbuckle.AspNetCore" Version="6.7.0',
  ),
  library(
    "benchmarkdotnet",
    "BenchmarkDotNet",
    "Benchmarking.",
    "using BenchmarkDotNet.Attributes;",
    'BenchmarkDotNet" Version="0.14.0',
  ),
  library(
    "nodatime",
    "NodaTime",
    "Date and time handling.",
    "using NodaTime;",
    'NodaTime" Version="3.1.11',
  ),
  library(
    "system-text-json",
    "System.Text.Json",
    "Built in JSON support.",
    "using System.Text.Json;",
    'System.Text.Json" Version="8.0.4',
  ),
];

const JAVA: readonly LanguageLibrary[] = [
  library(
    "spring-boot",
    "Spring Boot",
    "Application framework.",
    "import org.springframework.boot.SpringApplication;",
    "org.springframework.boot:spring-boot-starter:3.3.3",
  ),
  library(
    "junit",
    "JUnit 5",
    "Unit testing.",
    "import org.junit.jupiter.api.Test;",
    "org.junit.jupiter:junit-jupiter:5.11.0",
  ),
  library(
    "jackson",
    "Jackson",
    "JSON processing.",
    "import com.fasterxml.jackson.databind.ObjectMapper;",
    "com.fasterxml.jackson.core:jackson-databind:2.17.2",
  ),
  library(
    "gson",
    "Gson",
    "JSON by Google.",
    "import com.google.gson.Gson;",
    "com.google.code.gson:gson:2.11.0",
  ),
  library(
    "guava",
    "Guava",
    "Core utilities.",
    "import com.google.common.collect.ImmutableList;",
    "com.google.guava:guava:33.3.0-jre",
  ),
  library(
    "lombok",
    "Lombok",
    "Boilerplate reduction.",
    "import lombok.Data;",
    "org.projectlombok:lombok:1.18.34",
  ),
  library(
    "slf4j",
    "SLF4J",
    "Logging facade.",
    "import org.slf4j.Logger;",
    "org.slf4j:slf4j-api:2.0.16",
  ),
  library(
    "logback",
    "Logback",
    "Logging implementation.",
    "import ch.qos.logback.classic.Logger;",
    "ch.qos.logback:logback-classic:1.5.7",
  ),
  library(
    "mockito",
    "Mockito",
    "Mocking framework.",
    "import org.mockito.Mockito;",
    "org.mockito:mockito-core:5.13.0",
  ),
  library(
    "apache-commons-lang",
    "Commons Lang",
    "String and object helpers.",
    "import org.apache.commons.lang3.StringUtils;",
    "org.apache.commons:commons-lang3:3.17.0",
  ),
  library(
    "okhttp",
    "OkHttp",
    "HTTP client.",
    "import okhttp3.OkHttpClient;",
    "com.squareup.okhttp3:okhttp:4.12.0",
  ),
  library(
    "retrofit",
    "Retrofit",
    "Typed HTTP client.",
    "import retrofit2.Retrofit;",
    "com.squareup.retrofit2:retrofit:2.11.0",
  ),
  library(
    "hibernate",
    "Hibernate",
    "ORM framework.",
    "import org.hibernate.Session;",
    "org.hibernate.orm:hibernate-core:6.6.0.Final",
  ),
  library(
    "assertj",
    "AssertJ",
    "Fluent assertions.",
    "import static org.assertj.core.api.Assertions.assertThat;",
    "org.assertj:assertj-core:3.26.3",
  ),
  library(
    "rxjava",
    "RxJava",
    "Reactive streams.",
    "import io.reactivex.rxjava3.core.Observable;",
    "io.reactivex.rxjava3:rxjava:3.1.9",
  ),
  library(
    "netty",
    "Netty",
    "Async networking.",
    "import io.netty.bootstrap.ServerBootstrap;",
    "io.netty:netty-all:4.1.112.Final",
  ),
  library("jsoup", "jsoup", "HTML parsing.", "import org.jsoup.Jsoup;", "org.jsoup:jsoup:1.18.1"),
  library(
    "caffeine",
    "Caffeine",
    "In memory cache.",
    "import com.github.benmanes.caffeine.cache.Caffeine;",
    "com.github.ben-manes.caffeine:caffeine:3.1.8",
  ),
  library(
    "mapstruct",
    "MapStruct",
    "Bean mapping.",
    "import org.mapstruct.Mapper;",
    "org.mapstruct:mapstruct:1.6.0",
  ),
  library(
    "testcontainers",
    "Testcontainers",
    "Integration test containers.",
    "import org.testcontainers.containers.GenericContainer;",
    "org.testcontainers:testcontainers:1.20.1",
  ),
];

const KOTLIN: readonly LanguageLibrary[] = [
  library(
    "coroutines",
    "kotlinx.coroutines",
    "Structured concurrency.",
    "import kotlinx.coroutines.runBlocking",
    'implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")',
  ),
  library(
    "serialization",
    "kotlinx.serialization",
    "Serialisation.",
    "import kotlinx.serialization.Serializable",
    'implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.2")',
  ),
  library(
    "ktor-client",
    "Ktor client",
    "HTTP client.",
    "import io.ktor.client.HttpClient",
    'implementation("io.ktor:ktor-client-core:2.3.12")',
  ),
  library(
    "ktor-server",
    "Ktor server",
    "Web server.",
    "import io.ktor.server.engine.embeddedServer",
    'implementation("io.ktor:ktor-server-core:2.3.12")',
  ),
  library(
    "exposed",
    "Exposed",
    "SQL framework.",
    "import org.jetbrains.exposed.sql.Database",
    'implementation("org.jetbrains.exposed:exposed-core:0.53.0")',
  ),
  library(
    "koin",
    "Koin",
    "Dependency injection.",
    "import org.koin.core.context.startKoin",
    'implementation("io.insert-koin:koin-core:3.5.6")',
  ),
  library(
    "kotest",
    "Kotest",
    "Testing framework.",
    "import io.kotest.core.spec.style.StringSpec",
    'testImplementation("io.kotest:kotest-runner-junit5:5.9.1")',
  ),
  library(
    "mockk",
    "MockK",
    "Mocking for Kotlin.",
    "import io.mockk.mockk",
    'testImplementation("io.mockk:mockk:1.13.12")',
  ),
  library(
    "arrow",
    "Arrow",
    "Functional programming.",
    "import arrow.core.Either",
    'implementation("io.arrow-kt:arrow-core:1.2.4")',
  ),
  library(
    "datetime",
    "kotlinx-datetime",
    "Dates and times.",
    "import kotlinx.datetime.Clock",
    'implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")',
  ),
  library(
    "compose",
    "Compose Multiplatform",
    "Declarative UI.",
    "import androidx.compose.runtime.Composable",
    'implementation("org.jetbrains.compose.runtime:runtime:1.6.11")',
  ),
  library(
    "retrofit",
    "Retrofit",
    "Typed HTTP client.",
    "import retrofit2.Retrofit",
    'implementation("com.squareup.retrofit2:retrofit:2.11.0")',
  ),
  library(
    "okhttp",
    "OkHttp",
    "HTTP client.",
    "import okhttp3.OkHttpClient",
    'implementation("com.squareup.okhttp3:okhttp:4.12.0")',
  ),
  library(
    "room",
    "Room",
    "Android database.",
    "import androidx.room.Entity",
    'implementation("androidx.room:room-runtime:2.6.1")',
  ),
  library(
    "coil",
    "Coil",
    "Image loading.",
    "import coil.ImageLoader",
    'implementation("io.coil-kt:coil:2.7.0")',
  ),
  library(
    "sqldelight",
    "SQLDelight",
    "Typed SQL.",
    "import app.cash.sqldelight.db.SqlDriver",
    'implementation("app.cash.sqldelight:runtime:2.0.2")',
  ),
  library(
    "multik",
    "Multik",
    "Multidimensional arrays.",
    "import org.jetbrains.kotlinx.multik.api.mk",
    'implementation("org.jetbrains.kotlinx:multik-core:0.2.3")',
  ),
  library(
    "kotlin-logging",
    "kotlin-logging",
    "Logging wrapper.",
    "import io.github.oshai.kotlinlogging.KotlinLogging",
    'implementation("io.github.oshai:kotlin-logging-jvm:7.0.0")',
  ),
  library(
    "turbine",
    "Turbine",
    "Flow testing.",
    "import app.cash.turbine.test",
    'testImplementation("app.cash.turbine:turbine:1.1.0")',
  ),
  library(
    "clikt",
    "Clikt",
    "Command line parsing.",
    "import com.github.ajalt.clikt.core.CliktCommand",
    'implementation("com.github.ajalt.clikt:clikt:4.4.0")',
  ),
];

export const LANGUAGE_LIBRARIES: Record<string, readonly LanguageLibrary[]> = {
  python: PYTHON,
  cpp: CPP,
  c: CPP,
  rust: RUST,
  csharp: CSHARP,
  java: JAVA,
  kotlin: KOTLIN,
};

export const MANIFESTS: Record<string, ManifestDescriptor> = {
  python: {
    path: "requirements.txt",
    render: (libraries) => `${libraries.map((entry) => entry.manifestEntry).join("\n")}\n`,
  },
  rust: {
    path: "Cargo.toml",
    render: (libraries) =>
      `[package]\nname = "sandbox"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\n${libraries
        .map((entry) => entry.manifestEntry)
        .join("\n")}\n`,
  },
  cpp: {
    path: "vcpkg.json",
    render: (libraries) =>
      `${JSON.stringify(
        {
          name: "sandbox",
          version: "0.1.0",
          dependencies: libraries.map((entry) => entry.manifestEntry),
        },
        null,
        2,
      )}\n`,
  },
  c: {
    path: "vcpkg.json",
    render: (libraries) =>
      `${JSON.stringify(
        {
          name: "sandbox",
          version: "0.1.0",
          dependencies: libraries.map((entry) => entry.manifestEntry),
        },
        null,
        2,
      )}\n`,
  },
  csharp: {
    path: "sandbox.csproj",
    render: (libraries) =>
      `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n  <ItemGroup>\n${libraries
        .map((entry) => `    <PackageReference Include="${entry.manifestEntry}" />`)
        .join("\n")}\n  </ItemGroup>\n</Project>\n`,
  },
  java: {
    path: "pom.xml",
    render: (libraries) =>
      `<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>dev.codesandbox</groupId>\n  <artifactId>sandbox</artifactId>\n  <version>1.0.0</version>\n  <dependencies>\n${libraries
        .map((entry) => {
          const [groupId = "", artifactId = "", version = ""] = entry.manifestEntry.split(":");
          return `    <dependency>\n      <groupId>${groupId}</groupId>\n      <artifactId>${artifactId}</artifactId>\n      <version>${version}</version>\n    </dependency>`;
        })
        .join("\n")}\n  </dependencies>\n</project>\n`,
  },
  kotlin: {
    path: "build.gradle.kts",
    render: (libraries) =>
      `plugins {\n    kotlin("jvm") version "2.0.20"\n}\n\nrepositories {\n    mavenCentral()\n}\n\ndependencies {\n${libraries
        .map((entry) => `    ${entry.manifestEntry}`)
        .join("\n")}\n}\n`,
  },
};

export function librariesFor(languageId: string): readonly LanguageLibrary[] {
  return LANGUAGE_LIBRARIES[languageId] ?? [];
}

export function manifestFor(
  languageId: string,
  libraries: readonly LanguageLibrary[],
): { path: string; content: string } | null {
  const descriptor = MANIFESTS[languageId];

  if (!descriptor || libraries.length === 0) {
    return null;
  }

  return { path: descriptor.path, content: descriptor.render(libraries) };
}
