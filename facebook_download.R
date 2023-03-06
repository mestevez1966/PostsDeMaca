

getPage <- function (page, token, n = 25, since = NULL, until = NULL, feed = FALSE, 
                     reactions = FALSE, verbose = TRUE, api = NULL) {
  url <- paste0("https://graph.facebook.com/", page, "/posts?fields=from,message,created_time,full_picture,comments.summary(true)", 
                ",likes.summary(true),shares")
  if (feed) {
    url <- paste0("https://graph.facebook.com/", page, "/feed?fields=from,message,created_time,full_picture,comments.summary(true)", 
                  ",likes.summary(true),shares")
  }
  if (!is.null(until)) {
    url <- paste0(url, "&until=", until)
  }
  if (!is.null(since)) {
    url <- paste0(url, "&since=", since)
  }
  if (n <= 25) {
    url <- paste0(url, "&limit=", n)
  }
  if (n > 25) {
    url <- paste0(url, "&limit=25")
  }
  content <- Rfacebook::callAPI(url = url, token = token, api = api)
  l <- length(content$data)
  if (verbose) 
    cat(l, "posts ")
  error <- 0
  while (length(content$error_code) > 0) {
    cat("Error!\n")
    Sys.sleep(0.5)
    error <- error + 1
    content <- Rfacebook::callAPI(url = url, token = token)
    if (error == 3) {
      stop(content$error_msg)
    }
  }
  if (length(content$data) == 0) {
    message("No public posts were found : ", page)
    return(data.frame())
  }
  df <- pageDataToDF(content$data)
  if (!is.null(since)) {
    dates <- Rfacebook:::formatFbDate(df$created_time, "date")
    mindate <- min(dates)
    sincedate <- as.Date(since)
  }
  if (is.null(since)) {
    sincedate <- as.Date("1970/01/01")
    mindate <- as.Date(Sys.time())
  }
  if (n > 25) {
    df.list <- list(df)
    while (l < n & length(content$data) > 0 & !is.null(content$paging$`next`) & 
           sincedate <= mindate) {
      Sys.sleep(0.5)
      url <- content$paging$`next`
      content <- Rfacebook::callAPI(url = url, token = token, api = api)
      l <- l + length(content$data)
      if (length(content$data) > 0) {
        if (verbose) 
          cat(l, "posts ")
      }
      error <- 0
      while (length(content$error_code) > 0) {
        cat("Error!\n")
        Sys.sleep(0.5)
        error <- error + 1
        content <- Rfacebook::callAPI(url = url, token = token, 
                           api = api)
        if (error == 3) {
          stop(content$error_msg)
        }
      }
      new.df <- pageDataToDF(content$data)
      df.list <- c(df.list, list(new.df))
      if (!is.null(since) & nrow(new.df) > 0) {
        dates <- Rfacebook:::formatFbDate(new.df$created_time, "date")
        mindate <- min(dates)
      }
    }
    df <- do.call(rbind, df.list)
  }
  if (nrow(df) > n) {
    df <- df[1:n, ]
  }
  if (!is.null(since)) {
    dates <- Rfacebook:::formatFbDate(df$created_time, "date")
    df <- df[dates >= sincedate, ]
  }
  if (reactions == TRUE) {
    re = getReactions(df$id, token = token, verbose = FALSE, 
                      api = api)
    df <- merge(df, re, all.x = TRUE)
    df <- df[order(df$created_time), ]
  }
  return(df)
}

pageDataToDF <- function (json) {
  df <- data.frame(from_id = Rfacebook:::unlistWithNA(json, c("from", "id")), 
                   from_name = Rfacebook:::unlistWithNA(json, c("from", "name")),
                   message = Rfacebook:::unlistWithNA(json, "message"),
                   created_time = Rfacebook:::unlistWithNA(json, "created_time"), 
                   picture = Rfacebook:::unlistWithNA(json, "full_picture"), 
                   id = Rfacebook:::unlistWithNA(json, "id"),
                   likes_count = Rfacebook:::unlistWithNA(json, c("likes","summary", "total_count")),
                   comments_count = Rfacebook:::unlistWithNA(json, c("comments", "summary", "total_count")),
                   shares_count = Rfacebook:::unlistWithNA(json, c("shares", "count")), stringsAsFactors = F)
  return(df)
}


#-------------------------------
# My data
#-------------------------------
token <- Sys.getenv("FB_TOKEN")

page <- "PostsDeMaca"
# from <- "Sys.Date()"
# to <- Sys.time()


#-------------------------------
# Get the data
#-------------------------------

data <- getPage(page, token
                ,
                since = "2023-01-04", until = Sys.time()
)
# View(data)

# Get only posts with pictures (should be all)
data <- data[!is.na(data$picture), ]


#-------------------------------
# Process the data
#-------------------------------

if(nrow(data) == 0){
  
  # Do nothing
  print("Nothing to do here today")
  return()
  
  
} else {
  
  #-------------------------------
  # Set categories
  #-------------------------------
  
  category <- numeric(nrow(data))
  
  for(i in 1:nrow(data)) {
    
    if(grepl("#IA|#Analytics", data$message[i], fixed = FALSE)){
      
      cat <- "A"
      
    } else {
      
      if(grepl("#Business", data$message[i], fixed = TRUE)) {
        cat <- "B"
      } else {
        
        if(grepl("#Life|#Futuro|#Vida", data$message[i], fixed = FALSE)) {
          cat <- "C"
        } else {
          
          cat <- "D"
          
        }
      }
      
    }
    
    category[i] <- cat
    
  }
  
  data <- cbind(data, category)
  
  data$message <- gsub("Si quieres ver todos mis posts y formato ppt: www.postsdemaca.com", "", data$message)
  
  
  #-------------------------------
  # Download images
  #-------------------------------
  
  # Error handling
  w <- 1
  err <- numeric()
  
  j <- 2
  
  img_name <- c()
  
  for(i in 1:nrow(data)){
    
    img_name[i] <- paste0("static/", Sys.Date(), "_", i, ".png")
    
    tempfile()
    
    tryCatch(download.file(data$picture[i], img_name[i]),
             error = function(e) {
               w <- w + 1
               paste("Error en ", i)
               err[w] <- i
             })
  }
  
  #-------------------------------
  # Create markdown files
  #-------------------------------
  
  for(i in 1:nrow(data)){
    
    file_name <- paste0("content/posts/", format(Sys.Date(), "%Y"), "/", paste0(Sys.Date(), "_", i) , ".md")
    
    sink(file = file_name)
    
    cat("---", "\n")
    cat("category:", data$cat[i], "\n")
    cat(paste("date:", Sys.Date()), "\n")
    cat(paste0("image: ", substring(img_name[i], 7)), "\n")
    cat("---", "\n")
    cat(sep = "\n")
    
    cat(data$message[i])
    
    sink()
  }
  
}


# url <- paste0("https://graph.facebook.com/", page, "/posts?fields=from,message,full_picture,created_time",
#               "&limit=25&access_token=", token)
# data <- callAPI(url = url, token = token)
